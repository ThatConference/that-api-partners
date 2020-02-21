import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:query:PartnersQuery');

export const fieldResolvers = {
  PartnersQuery: {
    all: (_, __, { dataSources }) => {
      dlog('all');
      return partnerStore(dataSources.firestore).getAll();
    },

    partner: (_, { id }, { dataSources }) => {
      dlog('partner');
      return partnerStore(dataSources.firestore).get(id);
    },

    partnerBySlug: (_, { slug }, { dataSources }) => {
      dlog('partnerBySlug');
      return partnerStore(dataSources.firestore).findBySlug(slug);
    },
  },
};
