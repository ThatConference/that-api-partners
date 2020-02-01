/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';

const dlog = debug('that:api:partners:mutations:JobListingsMutation');

export const fieldResolvers = {
  JobListingsMutation: {
    create: ({ partnerId }, { jobListing }, { dataSources: { firestore } }) => {
      dlog('create');
      return jobListingStore(firestore).add(partnerId, jobListing);
    },

    delete: ({ partnerId }, { id }, { dataSources: { firestore } }) => {
      dlog('delete');
      return jobListingStore(firestore).remove(partnerId, id);
    },

    jobListing: ({ partnerId }, { id }) => ({ partnerId, jobListingId: id }),
  },
};
