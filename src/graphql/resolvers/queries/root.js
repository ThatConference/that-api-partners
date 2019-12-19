import debug from 'debug';

const dlog = debug('that-api-partners:query');

const resolvers = {
  partners: () => {
    dlog('root:partners query called');
    return {};
  },
};

export default resolvers;
