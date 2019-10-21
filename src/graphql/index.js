import { ApolloServer, gql } from 'apollo-server-cloud-functions';
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
const createServer = ({ dataSources, Sentry, ...rest }) =>
  new ApolloServer({
    schemaDirectives: {},
    schema: buildFederatedSchema([{ typeDefs, resolvers }]),
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

    // todo: an opportunity to do more logging etc before we return to the user.
    formatError: error => error,
  });

export default createServer;
