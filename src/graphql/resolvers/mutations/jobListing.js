/* eslint-disable import/prefer-default-export */
export const fieldResolvers = {
  JobListingMutation: {
    update: (
      { partnerId, jobListingId },
      { jobListing },
      { dataSources: { firestore, logger } },
    ) => {
      logger.debug('JobListingMutation:milestone called');
      throw new Error('Not implemented yet.');
    },
  },
};
