import debug from 'debug';
import { dataSources } from '@thatconference/api';

import partnerStore from '../../../dataSources/cloudFirestore/partner';

const favoriteStore = dataSources.cloudFirestore.favorites;
const favoriteType = 'partner';

const dlog = debug('that:api:partners:mutations:PartnersMutation');

export const fieldResolvers = {
  PartnerFavoritingMutation: {
    toggle: async (
      { partnerId, slug },
      __,
      { dataSources: { firestore }, user },
    ) => {
      dlog('toggle partner %s, for user %s', slug, user.sub);
      const fav = await favoriteStore(firestore).findFavoriteForMember({
        favoritedId: partnerId,
        favoriteType,
        user,
      });

      let result = null;
      if (fav) {
        dlog('favorite exists, removing');
        await favoriteStore(firestore).removeFavorite({
          favoriteId: fav.id,
          user,
        });
      } else {
        dlog(`favorite doesn't exist, adding`);
        const partnerToFavorite = await partnerStore(firestore).get(partnerId);
        if (partnerToFavorite) {
          const newFav = await favoriteStore(firestore).addFavoriteForMember({
            favoritedId: partnerId,
            favoriteType,
            user,
          });
          if (!newFav)
            throw new Error(
              `New favorite on ${partnerId} for member failed to create`,
            );
          result = partnerToFavorite;
        } else {
          dlog('partner not found, not set as favorite');
        }
      }

      return result;
    },
  },
};
