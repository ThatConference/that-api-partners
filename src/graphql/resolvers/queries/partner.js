/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';
import membersStore from '../../../dataSources/cloudFirestore/members';
import sessionsStore from '../../../dataSources/cloudFirestore/sessions';

const dlog = debug('that:api:partners:query:partner');

export const refResolvers = {
  Partner: {
    __resolveReference({ id }, { dataSources: { firestore, partnerLoader } }) {
      dlog('resolve reference');
      return partnerLoader.load(id);
    },

    members: ({ id }, _, { dataSources: { firestore } }) => {
      dlog('members');

      return membersStore(firestore)
        .findPartners(id)
        .then(r =>
          r.map(s => ({
            ...s,
            __typename: 'Profile',
          })),
        );
    },

    sessions: ({ id }, _, { dataSources: { firestore } }) => {
      dlog('sessions');

      return sessionsStore(firestore)
        .findPartners(id)
        .then(r =>
          r.map(s => ({
            ...s,
            __typename: 'Session',
          })),
        );
    },

    jobListings: ({ id }, _, { dataSources: { firestore } }) => {
      dlog('jobListings');
      return jobListingStore(firestore).findPartners(id);
    },
  },
};
