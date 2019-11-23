/* eslint-disable import/prefer-default-export */
import 'dotenv/config';
import connect from 'connect';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';
import loglevel, { Logger } from 'loglevel';
import loglevelDebug from 'loglevel-debug';
import responseTime from 'response-time';
import * as Sentry from '@sentry/node';
import uuid from 'uuid/v4';

import apolloGraphServer from './graphql';

const api = connect();
const logger = loglevel.getLogger(`that-api-partners:`);

loglevelDebug(logger);
if (process.env.NODE_ENV === 'development') {
  logger.enableAll();
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.THAT_ENVIRONMENT,
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

    logger.info('mocking enabled');

    const headerValues = req.headers['that-enable-mocks'].split(',');
    const mocks = headerValues.map(i => i.trim().toUpperCase());

    return !!mocks.includes('PARTNERS');
  };

  req.userContext = {
    locale: req.headers.locale,
    authToken: req.headers.authorization,
    correlationId: req.headers['correlation-id']
      ? req.headers['correlation-id']
      : uuid(),
    sentry: Sentry,
    logger,
    enableMocking: enableMocking(),
    firestore: new Firestore(),
  };

  next();
}

function apiHandler(req, res) {
  logger.info('api handler called');

  const graphServer = apolloGraphServer(
    createConfig(),
    req.userContext.enableMocking,
  );

  const graphApi = graphServer.createHandler();
  graphApi(req, res);
}

function failure(err, req, res, next) {
  logger.trace('Middleware Catch All');
  logger.error('catchall', err);
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
  .use(cors())
  .use(useSentry)
  .use(createUserContext)
  .use(apiHandler)
  .use(failure);
