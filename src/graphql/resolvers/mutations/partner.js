/* eslint-disable import/prefer-default-export */
import partnerStore from '../../../dataSources/cloudFirestore/partner';

export const fieldResolvers = {
  PartnerMutation: {
    update: async (
      { partnerId },
      { partner },
      { dataSources: { firestore, logger } },
    ) => {
      logger.debug('PartnerMutation.event called.');
      return partnerStore(firestore, logger).update(partnerId, partner);
    },
    jobListing: ({ partnerId }) => ({ partnerId }),
  },
};
