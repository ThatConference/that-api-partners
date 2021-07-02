import debug from 'debug';

const dlog = debug('that:api:partners:me');

export const fieldResolvers = {
  MePartnerQuery: {
    favorites: () => {
      dlog('favorites called');
      return {};
    },
    leads: () => {
      dlog('leads called');
      return {};
    },
  },
};
