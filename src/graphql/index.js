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
const createServer = ({ dataSources, ...rest }, enableMocking = false) => {
  let schema = {};

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

    // todo: here is where we build up our dataSources for our resolvers to use later.
    dataSources: () => ({
      ...dataSources,
    }),

    // todo: here is where we will build our users context that our resolvers can leverage later.
    context: async ({ req }) => ({
      ...(req && req.context),
    }),

    formatError: err => {
      dataSources.sentry.captureException(err);
      return err;
    },
  });
};

export default createServer;
