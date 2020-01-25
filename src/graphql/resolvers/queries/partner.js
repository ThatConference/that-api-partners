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

    sessions: (parent, args, { dataSources: { firestore, logger } }) => {
      dlog('Partner:sessions ref');
      // todo: need to resolve what sessions are related to this partner
      return [];
    },
  },
};
