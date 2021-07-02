import debug from 'debug';
import leadStore from '../../../dataSources/cloudFirestore/leads';

const dlog = debug('that:api:partners:query:us:leads');

export const fieldResolvers = {
  UsPartnerLeadsQuery: {
    all: ({ partnerId, slug }, __, { dataSources: { firestore } }) => {
      dlog('all called %s', slug);
      return leadStore(firestore).findByPartner(partnerId);
    },
  },
};
