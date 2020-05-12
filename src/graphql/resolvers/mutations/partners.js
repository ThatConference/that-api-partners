import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:mutations:PartnersMutation');

export const fieldResolvers = {
  PartnersMutation: {
    create: (_, { partner }, { dataSources: { firestore } }) => {
      dlog('create');
      return partnerStore(firestore).create(partner);
    },

    delete: () => {
      dlog('delete');
      throw new Error('Not Implemented yet.');
    },

    partner: (_, { id }) => ({ partnerId: id }),
  },
};
