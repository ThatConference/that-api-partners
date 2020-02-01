import debug from 'debug';

const dlog = debug('that:api:partners:mutations:root');

const resolvers = {
  partners: () => {
    dlog('partners');
    return {};
  },
};

export default resolvers;
