/* eslint-disable import/prefer-default-export */
import partnerStore from '../../../dataSources/cloudFirestore/partner';

export const fieldResolvers = {
  JobListingsMutation: {
    create: async (
      { partnerId },
      { jobListing },
      { dataSources: { firestore, logger } },
    ) => {
      logger.debug('JobListingsMutation:create called.');
      // return partnerStore(firestore, logger).create(partner);
      throw new Error('Not Implemented yet.');
    },

    delete: ({ partnerId }, { id }, { dataSources: { firestore, logger } }) => {
      logger.debug('JobListingsMutation:delete called.');
      throw new Error('Not Implemented yet.');
    },

    jobListing: ({ partnerId }, { id }) => ({ partnerId, jobListingId: id }),
  },
};
