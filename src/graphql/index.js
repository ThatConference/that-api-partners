import {
  ApolloServer,
  gql,
  addMockFunctionsToSchema,
} from 'apollo-server-cloud-functions';
import { buildFederatedSchema } from '@apollo/federation';

// Graph Types and Resolvers
import typeDefsRaw from './typeDefs';
import resolvers from './resolvers';

// convert our raw schema to gql
const typeDefs = gql`
  ${typeDefsRaw}
`;

/**
 * will create you a configured instance of an apollo gateway
 * @param {object} userContext - user context that w
 * @return {object} a configured instance of an apollo gateway.
 *
 * @example
 *
 *     createGateway(userContext)
 */
const createServer = ({ dataSources }, enableMocking = false) => {
  let schema = {};
  const { logger } = dataSources;

  if (!enableMocking) {
    schema = buildFederatedSchema([{ typeDefs, resolvers }]);
  } else {
    schema = buildFederatedSchema([{ typeDefs }]);

    addMockFunctionsToSchema({
      schema,
      // eslint-disable-next-line global-require
      mocks: require('./__mocks__').default(),
      preserveResolvers: true, // so GetServiceDefinition works
    });
  }

  return new ApolloServer({
    schemaDirectives: {},
    schema,
    introspection: JSON.parse(process.env.ENABLE_GRAPH_INTROSPECTION || false),
    playground: JSON.parse(process.env.ENABLE_GRAPH_PLAYGROUND)
      ? { endpoint: '/' }
      : false,

    dataSources: () => ({
      ...dataSources,
    }),

    context: async ({ req }) => ({
      ...(req && req.context),
    }),

    formatError: err => {
      logger.warn('graphql error', err);

      dataSources.sentry.captureException(err);

      return err;
    },
  });
};

export default createServer;
