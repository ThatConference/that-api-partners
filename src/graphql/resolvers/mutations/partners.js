/* eslint-disable import/prefer-default-export */
import partnerStore from '../../../dataSources/cloudFirestore/partner';

export const fieldResolvers = {
  PartnersMutation: {
    create: async (
      parent,
      { partner },
      { dataSources: { firestore, logger } },
    ) => {
      logger.debug('PartnersMutation:create called.');
      return partnerStore(firestore, logger).create(partner);
    },

    delete: (parent, { id }, { dataSources: { firestore, logger } }) => {
      logger.debug('PartnersMutation:delete called.');
      throw new Error('Not Implemented yet.');
    },

    partner: (parent, { id }) => ({ partnerId: id }),
  },
};
