import queries, { fieldResolvers as qFieldResolvers } from './queries';
import mutations, { fieldResolvers as mFieldResolvers } from './mutations';

const createServer = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
  ...qFieldResolvers,
  ...mFieldResolvers,
};

export default createServer;
