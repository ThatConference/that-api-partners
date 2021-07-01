import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';
import partnerFindBy from '../../../lib/partnerFindBy';

const dlog = debug('that:api:partners:query:partners');

export const fieldResolvers = {
  PartnersQuery: {
    all: (_, __, { dataSources }) => {
      dlog('all');
      return partnerStore(dataSources.firestore).getAll();
    },

    partner: (_, { findBy }, { dataSources: { firestore } }) => {
      dlog('partner');
      return partnerFindBy(findBy, firestore).then(d =>
        partnerStore(firestore).get(d.partnerId),
      );
    },

    me: () => {
      dlog('me called');
      return {};
    },

    us: () => {
      dlog('us called');
      return {};
    },
  },
};
