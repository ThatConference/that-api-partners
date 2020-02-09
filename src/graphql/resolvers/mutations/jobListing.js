/* eslint-disable import/prefer-default-export */
import debug from 'debug';
import slugify from 'slugify';

import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';

const dlog = debug('that:api:partners:mutations:JobListingMutation');

export const fieldResolvers = {
  JobListingMutation: {
    update: (
      { partnerId, jobListingId },
      { jobListing },
      { dataSources: { firestore } },
    ) => {
      dlog('update');

      const modifiedJobListing = {
        slug: slugify(jobListing.title.toLowerCase()),
        ...jobListing,
      };

      return jobListingStore(firestore).update(
        partnerId,
        jobListingId,
        modifiedJobListing,
      );
    },
  },
};
