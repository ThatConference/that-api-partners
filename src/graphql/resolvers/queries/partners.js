/* eslint-disable import/prefer-default-export */
import debug from 'debug';
import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('asdf');

export const fieldResolvers = {
  PartnersQuery: {
    all: async (parent, args, { dataSources }) => {
      dlog('asdf');
      return partnerStore(dataSources.firestore).getAll();
    },

    partner: async (parent, { id }, { dataSources }) => {
      dlog('asdf');
      return partnerStore(dataSources.firestore).get(id);
    },

    partnerBySlug: async (parent, { slug }, { dataSources }) => {
      dlog('asdf');
      return partnerStore(dataSources.firestore).findBySlug(slug);
    },
  },
};
