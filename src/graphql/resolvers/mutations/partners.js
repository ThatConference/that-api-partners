/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:mutations:PartnersMutation');

export const fieldResolvers = {
  PartnersMutation: {
    create: async (
      parent,
      { partner },
      { dataSources: { firestore, logger } },
    ) => {
      dlog('create');
      return partnerStore(firestore, logger).create(partner);
    },

    delete: (parent, { id }, { dataSources: { firestore, logger } }) => {
      dlog('delete');
      throw new Error('Not Implemented yet.');
    },

    partner: (parent, { id }) => ({ partnerId: id }),
  },
};
