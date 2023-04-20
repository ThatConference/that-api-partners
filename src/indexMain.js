/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
import express from 'express';
import http from 'node:http';
import { json } from 'body-parser';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import debug from 'debug';
import { Firestore } from '@google-cloud/firestore';
import { Client as Postmark } from 'postmark';
import responseTime from 'response-time';
import * as Sentry from '@sentry/node';
import { v4 as uuidv4 } from 'uuid';

import apolloGraphServer from './graphql';
import envConfig from './envConfig';
import userEventEmitter from './events/user';

let version;
(async () => {
  let p;
  try {
    p = await import('./package.json');
  } catch {
    p = await import('../package.json');
  }
  version = p.version;
})();

const dlog = debug('that:api:partners:index');
const firestore = new Firestore();
const defaultVersion = `that-api-partners@${version}`;
const postmark = new Postmark(envConfig.postmarkApiToken);
const userEvents = userEventEmitter(postmark);
const api = express();
const port = process.env.PORT || 8002;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.THAT_ENVIRONMENT,
  release: process.env.SENTRY_VERSION || defaultVersion,
  debug: process.env.NODE_ENV === 'development',
  normalizeDepth: 6,
});

Sentry.configureScope(scope => {
  scope.setTag('thatApp', 'that-api-partners');
});

const httpServer = http.createServer(api);

const createConfig = () => ({
  dataSources: {
    sentry: Sentry,
    firestore,
    postmark,
    events: {
      userEvents,
    },
  },
  httpServer,
});

const graphServerParts = apolloGraphServer(createConfig());

const sentryMark = async (req, res, next) => {
  Sentry.addBreadcrumb({
    category: 'that-api-partners',
    message: 'partner init',
    level: 'info',
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
  const correlationId =
    req.headers['that-correlation-id'] &&
    req.headers['that-correlation-id'] !== 'undefined'
      ? req.headers['that-correlation-id']
      : uuidv4();

  Sentry.configureScope(scope => {
    scope.setTag('correlationId', correlationId);
    scope.setContext('headers', {
      headers: req.headers,
    });
  });

  let site;
  if (req.headers['that-site']) {
    site = req.headers['that-site'];
  } else if (req.headers['x-forwarded-for']) {
    // eslint-disable-next-line no-useless-escape
    const rxHost = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i;
    const refererHost = req.headers['x-forwarded-for'];
    const host = refererHost.match(rxHost);
    if (host) [, site] = host;
  } else {
    site = 'www.thatconference.com';
  }

  Sentry.configureScope(scope => {
    scope.setTag('site', site);
  });

  req.userContext = {
    locale: req.headers.locale,
    authToken: req.headers.authorization,
    correlationId,
    site,
  };
  dlog('headers %o', req.headers);
  dlog('userContext %o', req.userContext);

  next();
}

function failure(err, req, res, next) {
  dlog('error %o', err);
  Sentry.captureException(err);

  res.set('Content-Type', 'application/json').status(500).json(err.message);
}

// api.use(responseTime()).use(useSentry).use(createUserContext).use(failure);

api.use(
  Sentry.Handlers.requestHandler(),
  cors(),
  responseTime(),
  json(),
  sentryMark,
  createUserContext,
);

const { graphQlServer, createContext } = graphServerParts;

graphQlServer
  .start()
  .then(() => {
    api.use(
      expressMiddleware(graphQlServer, {
        context: async ({ req }) => createContext({ req }),
      }),
    );
  })
  .catch(err => {
    console.log(`graphServer.start() error 💥: ${err.message}`);
    throw err;
  });

api.use(Sentry.Handlers.errorHandler()).use(failure);

api.listen({ port }, () =>
  console.log(`✨ Partners 🤝 is running on port 🚢 ${port}`),
);
