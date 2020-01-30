/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:events:query:partner');

export const refResolvers = {
  Partner: {
    __resolveReference({ id }, { dataSources: { firestore, partnerLoader } }) {
      dlog('Partner:federated resolveRef');
      return partnerLoader.load(id);
    },

    members: ({ id }) => {
      dlog('Partner:members ref');

      if (id === 'wPA6h12zXHt5q8240bCg') {
        return [
          {
            __typename: 'Profile',
            id: '1234',
          },
          {
            __typename: 'Profile',
            id: '4321',
          },
        ];
      }

      return [];
    },

    sessions: ({ id }) => {
      dlog('Partner:sessions ref');

      if (id === 'wPA6h12zXHt5q8240bCg') {
        return [
          {
            __typename: 'Session',
            id: '1',
          },
          {
            __typename: 'Session',
            id: '2',
          },
        ];
      }

      return [];
    },

    jobListings: ({ id }) => {
      if (id === 'wPA6h12zXHt5q8240bCg') {
        return [
          {
            id: '1234',
            title: 'fake as',
            description: 'fake as',
            jobType: 'PART_TIME',
            internship: false,
            experienceLevel: 'SENIOR',
            relocationOffered: false,
            remote: false,
            role: 'fake as',
            featured: false,
          },
          {
            id: '2345',
            title: 'another great job',
            description: 'fake as',
            jobType: 'PART_TIME',
            internship: false,
            experienceLevel: 'SENIOR',
            relocationOffered: false,
            remote: false,
            role: 'fake as',
            featured: false,
          },
        ];
      }

      return [];
    },
  },
};
