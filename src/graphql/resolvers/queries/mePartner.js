import debug from 'debug';

const dlog = debug('that:api:partners:me:query');

export const fieldResolvers = {
  MePartnerQuery: {
    favorites: () => {
      dlog('mePartnersQuery called');
      return {};
    },
  },
};
