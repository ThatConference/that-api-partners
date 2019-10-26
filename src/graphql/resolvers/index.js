import queries from './queries';
import mutations from './mutations';

const createServer = {
  Query: {
    ...queries,
  },
  Mutation: {
    ...mutations,
  },
};

export default createServer;
