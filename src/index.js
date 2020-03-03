import 'dotenv/config';
import connect from 'connect';
import debug from 'debug';
import { Firestore } from '@google-cloud/firestore';
import responseTime from 'response-time';
import * as Sentry from '@sentry/node';
import uuid from 'uuid/v4';

import apolloGraphServer from './graphql';
import { version } from '../package.json';

const dlog = debug('that:api:partners:index');
const defaultVersion = `that-api-gateway@${version}`;
const firestore = new Firestore();
const api = connect();

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
    firestore,
  },
});

const graphServer = apolloGraphServer(createConfig());

const useSentry = async (req, res, next) => {
  Sentry.addBreadcrumb({
    category: 'root',
    message: 'init',
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

  Sentry.configureScope(scope => {
    scope.setTag('correlationId', correlationId);
  });

  req.userContext = {
    authToken: req.headers.authorization,
    correlationId,
    sentry: Sentry,
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
  .use(useSentry)
  .use(createUserContext)
  .use(apiHandler)
  .use(failure);
