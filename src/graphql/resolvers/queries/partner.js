import debug from 'debug';
import { dataSources } from '@thatconference/api';

import jobListingStore from '../../../dataSources/cloudFirestore/jobListing';
import membersStore from '../../../dataSources/cloudFirestore/members';
import sessionsStore from '../../../dataSources/cloudFirestore/sessions';

const dlog = debug('that:api:partners:query:partner');
const favoriteStore = dataSources.cloudFirestore.favorites;
const favoriteType = 'partner';
const assetStore = dataSources.cloudFirestore.assets;
const entityType = 'PARTNER';

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
          r
            .filter(u => u.isSponsoredFeatured)
            .map(s => ({
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

    jobListing: ({ id }, { slug }, { dataSources: { firestore } }) => {
      dlog('jobListings');
      return jobListingStore(firestore).findBySlug(id, slug);
    },

    jobListings: (
      { id },
      { isFeatured = false },
      { dataSources: { firestore } },
    ) => {
      dlog('jobListings');
      return jobListingStore(firestore).findPartners(id, isFeatured);
    },

    followCount: ({ id }, __, { dataSources: { firestore } }) => {
      dlog('followCount called');
      return favoriteStore(firestore).getFavoriteCount({
        favoritedId: id,
        favoriteType,
      });
    },

    followers: (
      { id },
      { pageSize, cursor },
      { dataSources: { firestore } },
    ) => {
      dlog('followers called');
      return favoriteStore(firestore).getFollowersPaged({
        favoritedId: id,
        favoriteType,
        pageSize,
        cursor,
      });
    },

    lastUpdatedBy: ({ lastUpdatedBy }) => {
      let result = null;
      if (lastUpdatedBy) result = { id: lastUpdatedBy };

      return result;
    },

    assets: ({ id: entityId }, __, { dataSources: { firestore } }) => {
      dlog('partner assets request');
      return assetStore(firestore).findEntityAssets({
        entityId,
        entityType,
      });
    },
  },
};
