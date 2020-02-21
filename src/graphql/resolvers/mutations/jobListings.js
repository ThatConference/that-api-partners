import debug from 'debug';
import slugify from 'slugify';

import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';

const dlog = debug('that:api:partners:mutations:JobListingsMutation');

export const fieldResolvers = {
  JobListingsMutation: {
    create: ({ partnerId }, { jobListing }, { dataSources: { firestore } }) => {
      dlog('create');

      const modifiedJobListing = {
        slug: slugify(jobListing.title.toLowerCase()),
        ...jobListing,
      };

      return jobListingStore(firestore).add(partnerId, modifiedJobListing);
    },

    delete: ({ partnerId }, { id }, { dataSources: { firestore } }) => {
      dlog('delete');
      return jobListingStore(firestore).remove(partnerId, id);
    },

    jobListing: ({ partnerId }, { id }) => ({ partnerId, jobListingId: id }),
  },
};
