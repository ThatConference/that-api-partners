import queries, { refResolvers } from './queries';
import mutations from './mutations';

const createServer = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
  ...refResolvers,
};

export default createServer;
