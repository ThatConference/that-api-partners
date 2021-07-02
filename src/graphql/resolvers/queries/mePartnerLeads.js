import debug from 'debug';

const dlog = debug('that:api:partners:query:me:leads');

export const fieldResolvers = {
  MePartnerLeadsQuery: {
    all: () => {
      dlog('all called');
      return {};
    },
  },
};
