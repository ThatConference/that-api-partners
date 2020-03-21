import 'dotenv/config';
import connect from 'express';
import debug from 'debug';
import { Firestore } from '@google-cloud/firestore';
import pino from 'pino';
import responseTime from 'response-time';
import * as Sentry from '@sentry/node';
import uuid from 'uuid/v4';
import { middleware } from '@thatconference/api';

import apolloGraphServer from './graphql';
import { version } from '../package.json';

const dlog = debug('that:api:partners:index');
const defaultVersion = `that-api-gateway@${version}`;
const firestore = new Firestore();
const api = connect();
const { requestLogger } = middleware;

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
  debug: process.env.NODE_ENV === 'development',
});

Sentry.configureScope(scope => {
  scope.setTag('thatApp', 'that-api-partners');
});

const createConfig = () => ({
  dataSources: {
    sentry: Sentry,
    logger,
    firestore,
  },
});

const graphServer = apolloGraphServer(createConfig());

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

    dlog('mocking enabled');

    const headerValues = req.headers['that-enable-mocks'].split(',');
    const mocks = headerValues.map(i => i.trim().toUpperCase());

    return !!mocks.includes('PARTNERS');
  };

  const correlationId = req.headers['that-correlation-id']
    ? req.headers['that-correlation-id']
    : uuid();

  const contextLogger = logger.child({ correlationId });

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

const graphApi = graphServer.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});

function apiHandler(req, res) {
  dlog('api handler called');
  graphApi(req, res);
}

function failure(err, req, res, next) {
  dlog('error %o', err);

  logger.error(err);
  logger.trace('Middleware Catch All');

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
  .use(responseTime())
  .use(requestLogger('that:api:partners').handler)
  .use(useSentry)
  .use(createUserContext)
  .use(apiHandler)
  .use(failure);
