import debug from 'debug';
import eventPartnerStore from '../../../dataSources/cloudFirestore/eventPartners';
import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';

const dlog = debug('that:api:partners:query:jobListing');
// Type located in Events api and extended here
export const fieldResolvers = {
  Community: {
    jobListings: (
      { slug: communitySlug },
      __,
      { dataSources: { firestore } },
    ) => {
      dlog('fetch job listings for %s', communitySlug);
      // const activePartners =
      return eventPartnerStore(firestore)
        .findActivePartners(communitySlug)
        .then(apIds => jobListingStore(firestore).findPartnerJobsBatch(apIds));
    },
  },
};
