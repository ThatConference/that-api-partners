import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import debug from 'debug';
import * as Sentry from '@sentry/node';
import { security } from '@thatconference/api';
import { isNil } from 'lodash';
import DataLoader from 'dataloader';

// Graph Types and Resolvers
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import directives from './directives';
import partnerStore from '../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:graphServer');
const jwtClient = security.jwt();

/**
 * creates an Apollo server instance and the context
 * Both are returned separately as the context is added to
 * Expressjs directly
 * @param {object} datasources - datasources to add to context
 * @param {object} httpServer - required for Apollo connection drain
 *
 * @return {object, object}
 */

const createServerParts = ({ dataSources, httpServer }) => {
  dlog('🚜 creating apollo server and context');
  let schema = {};

  dlog('🚜 building subgraph schema');
  schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  const directiveTransformers = [
    directives.auth('auth').authDirectiveTransformer,
  ];

  dlog('🚜 adding directiveTransformers: %O', directiveTransformers);
  schema = directiveTransformers.reduce(
    (curSchema, transformer) => transformer(curSchema),
    schema,
  );

  dlog('🚜 creating new apollo server instance');
  const graphQlServer = new ApolloServer({
    schema,
    introspection: JSON.parse(process.env.ENABLE_GRAPH_INTROSPECTION || false),
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: err => {
      dlog('formatError %O', err);

      Sentry.withScope(scope => {
        scope.setTag('formatError', true);
        scope.setLevel('warning');
        scope.setContext('originalError', { originalError: err.originalError });
        scope.setContext('path', { path: err.path });
        scope.setContext('error object', { error: err });
        if (err instanceof Error) {
          Sentry.captureException(err);
        } else {
          Sentry.captureException(new Error(err.message));
        }
      });

      return err;
    },
  });

  dlog('🚜 creating createContext function');
  const createContext = async ({ req, res }) => {
    dlog('🚜 building graphql user context');
    dlog('🚜 assembling datasources');
    const { firestore } = dataSources;
    let context = {
      dataSources: {
        ...dataSources,
        partnerLoader: new DataLoader(ids =>
          partnerStore(firestore)
            .getBatch(ids)
            .then(partners => {
              if (partners.includes(null)) {
                Sentry.withScope(scope => {
                  scope.setLevel('error');
                  scope.setContext(
                    `partner loader partner(s) don't exist in partners collection`,
                    { ids, partners },
                  );
                  Sentry.captureMessage(
                    `partner loader partner(s) don't exist in partners collection`,
                  );
                });
              }
              return ids.map(i => partners.find(p => p && p.id === i));
            }),
        ),
      },
    };

    dlog('🚜 auth header %o', req.headers);
    if (!isNil(req.headers.authorization)) {
      dlog('🚜 validating token for %o:', req.headers.authorization);

      Sentry.addBreadcrumb({
        category: 'graphql context',
        message: 'user has authToken',
        level: 'info',
      });

      const validatedToken = await jwtClient.verify(req.headers.authorization);

      Sentry.configureScope(scope => {
        scope.setUser({
          id: validatedToken.sub,
          permissions: validatedToken.permissions.toString(),
        });
      });

      dlog('🚜 validated token: %o', validatedToken);
      context = {
        ...context,
        user: {
          ...validatedToken,
          site: req.userContext.site,
          correlationId: req.userContext.correlationId,
        },
      };
    }

    return context;
  };

  return {
    graphQlServer,
    createContext,
  };
};

// const createServer = ({ dataSources }) => {
//   let schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
//   const directiveTransformers = [
//     directives.auth('auth').authDirectiveTransformer,
//   ];
//   dlog('directiveTransformers: %O', directiveTransformers);
//   schema = directiveTransformers.reduce(
//     (curSchema, transformer) => transformer(curSchema),
//     schema,
//   );

//   return new ApolloServer({
//     schema,
//     introspection: JSON.parse(process.env.ENABLE_GRAPH_INTROSPECTION || false),
//     csrfPrevention: true,
//     cache: 'bounded',
//     dataSources: () => {
//       dlog('creating dataSources');
//       const { firestore } = dataSources;
//       const partnerLoader = new DataLoader(ids =>
//         partnerStore(firestore)
//           .getBatch(ids)
//           .then(partners => {
//             if (partners.includes(null)) {
//               Sentry.withScope(scope => {
//                 scope.setLevel('error');
//                 scope.setContext(
//                   `partner loader partner(s) don't exist in partners collection`,
//                   { ids },
//                   { partners },
//                 );
//                 Sentry.captureMessage(
//                   `partner loader partner(s) don't exist in partners collection`,
//                 );
//               });
//             }
//             return ids.map(i => partners.find(p => p && p.id === i));
//           }),
//       );

//       return {
//         ...dataSources,
//         partnerLoader,
//       };
//     },
//     context: async ({ req, res }) => {
//       dlog('building graphql user context');
//       let context = {};

//       if (!isNil(req.headers.authorization)) {
//         dlog('validating token for %o:', req.headers.authorization);
//         Sentry.addBreadcrumb({
//           category: 'graphql context',
//           message: 'user has authToken',
//           level: 'info',
//         });

//         const validatedToken = await jwtClient.verify(
//           req.headers.authorization,
//         );

//         Sentry.configureScope(scope => {
//           scope.setUser({
//             id: validatedToken.sub,
//             permissions: validatedToken.permissions.toString(),
//           });
//         });

//         dlog('validated token: %o', validatedToken);
//         context = {
//           ...context,
//           user: {
//             ...validatedToken,
//             authToken: req.userContext.authToken,
//             site: req.userContext.site,
//             correlationId: req.userContext.correlationId,
//           },
//         };
//       }

//       return context;
//     },
//     plugins: [],
//     formatError: err => {
//       dlog('formatError %O', err);

//       Sentry.withScope(scope => {
//         scope.setTag('formatError', true);
//         scope.setLevel('warning');
//         scope.setExtra('originalError', err.originalError);
//         scope.setExtra('path', err.path);
//         Sentry.captureException(err);
//       });

//       return err;
//     },
//   });
// };

export default createServerParts;
