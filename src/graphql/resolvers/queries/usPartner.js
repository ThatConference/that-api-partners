import debug from 'debug';

const dlog = debug('that:api:partners:query:us');

export const fieldResolvers = {
  UsPartnerQuery: {
    leads: ({ partnerId, slug }) => {
      dlog('leads called');
      return { partnerId, slug };
    },
  },
};
