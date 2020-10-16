import debug from 'debug';
import { dataSources } from '@thatconference/api';
import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:favorites:query');
const favoriteStore = dataSources.cloudFirestore.favorites;
const favoriteType = 'partner';

export const fieldResolvers = {
  PartnerFavoritesQuery: {
    ids: (_, __, { dataSources: { firestore }, user }) => {
      dlog('ids called');
      return favoriteStore(firestore)
        .getFavoritedIdsForMember({
          memberId: user.sub,
          favoriteType,
        })
        .then(d => d.map(r => r.favoritedId));
    },

    partners: async (
      _,
      { pageSize, cursor },
      { dataSources: { firestore }, user },
    ) => {
      dlog('partners called');
      const favorites = await favoriteStore(
        firestore,
      ).getFavoritedIdsForMemberPaged({
        memberId: user.sub,
        favoriteType,
        pageSize,
        cursor,
      });

      const ids = favorites.favorites.map(f => f.favoritedId);
      const partners = await partnerStore(firestore).getBatch(ids);

      return {
        cursor: favorites.cursor,
        count: favorites.count,
        partners,
      };
    },
  },
};
