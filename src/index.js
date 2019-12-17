/* eslint-disable import/prefer-default-export */
import 'dotenv/config';
import connect from 'connect';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';
import pino from 'pino';
import pinoExpress from 'pino-express';
import responseTime from 'response-time';
import * as Sentry from '@sentry/node';
import uuid from 'uuid/v4';

import apolloGraphServer from './graphql';
import expressLoggingOptions from './expressLogOptions';

const { version } = require('../package.json');

const defaultVersion = `that-api-gateway@${version}`;

const api = connect();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: JSON.parse(process.env.LOG_PRETTY_PRINT || false)
    ? { colorize: true }
    : false,
  mixin() {
    return {
      service: 'that-api-partners',
    };
  },
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.THAT_ENVIRONMENT,
  release: process.env.SENTRY_VERSION || defaultVersion,
});

const createConfig = () => ({
  dataSources: {
    sentry: Sentry,
    logger,
    firestore: new Firestore(),
  },
});

Sentry.configureScope(scope => {
  scope.setTag('thatApp', 'that-api-partners');
});

const useSentry = async (req, res, next) => {
  Sentry.addBreadcrumb({
    category: 'that-api-partners',
    message: 'partner init',
    level: Sentry.Severity.Info,
  });
  next();
};

/**
 * http middleware function
 * here we are intercepting the http call and building our own notion of a users context.
 * we then add it to the request so it can later be used by the gateway.
 * If you had something like a token that needs to be passed through to the gateways children this is how you intercept it and setup for later.
 *
 * @param {string} req - http request
 * @param {string} res - http response
 * @param {string} next - next function to execute
 *
 */
function createUserContext(req, res, next) {
  const enableMocking = () => {
    if (!req.headers['that-enable-mocks']) return false;

    req.log.info('mocking enabled');

    const headerValues = req.headers['that-enable-mocks'].split(',');
    const mocks = headerValues.map(i => i.trim().toUpperCase());

    return !!mocks.includes('PARTNERS');
  };

  const correlationId = req.headers['that-correlation-id']
    ? req.headers['that-correlation-id']
    : uuid();

  const contextLogger = req.log.child({ correlationId });

  req.userContext = {
    locale: req.headers.locale,
    authToken: req.headers.authorization,
    correlationId,
    sentry: Sentry,
    logger: contextLogger,
    enableMocking: enableMocking(),
    firestore: new Firestore(),
  };

  next();
}

function apiHandler(req, res) {
  req.log.info('api handler called');

  const graphServer = apolloGraphServer(
    createConfig(),
    req.userContext.enableMocking,
  );

  const graphApi = graphServer.createHandler();
  graphApi(req, res);
}

function failure(err, req, res, next) {
  req.log.trace('Middleware Catch All');
  req.log.error('catchall', err);
  Sentry.captureException(err);

  res
    .set('Content-Type', 'application/json')
    .status(500)
    .json(err);
}

/**
 * http middleware function that follows adhering to express's middleware.
 * Last item in the middleware chain.
 * This is your api handler for your serverless function
 */
export const graphEndpoint = api
  .use(cors())
  .use(responseTime())
  .use(pinoExpress(logger, expressLoggingOptions))
  .use(useSentry)
  .use(createUserContext)
  .use(apiHandler)
  .use(failure);
