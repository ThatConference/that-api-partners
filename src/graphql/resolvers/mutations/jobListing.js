/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';

const dlog = debug('that:api:partners:JobListingMutation');

export const fieldResolvers = {
  JobListingMutation: {
    update: (
      { partnerId, jobListingId },
      { jobListing },
      { dataSources: { firestore } },
    ) => {
      dlog('update');
      return jobListingStore(firestore).update(
        partnerId,
        jobListingId,
        jobListing,
      );
    },
  },
};
