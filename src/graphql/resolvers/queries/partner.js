/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that-api-events:query');

export const refResolvers = {
  Partner: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveReference(partner, { dataSources }) {
      dlog('Partner:resolveRef');

      return partnerStore(dataSources.firestore).get(partner.id);
    },

    sessions: (parent, args, { dataSources: { firestore, logger } }) => {
      dlog('Partner:sessions ref');
      // todo: need to resolve what sessions are related to this partner
      return [];
    },
  },
};
