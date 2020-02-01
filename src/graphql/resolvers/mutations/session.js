/* eslint-disable import/prefer-default-export */
import debug from 'debug';

import sessionStore from '../../../dataSources/cloudFirestore/sessions';

const dlog = debug('that:api:partners:mutations:PartnerSessionsMutation');

export const fieldResolvers = {
  PartnerSessionMutation: {
    add: (
      { partnerId, sessionId },
      { session },
      { dataSources: { firestore } },
    ) => {
      dlog('create');
      return sessionStore(firestore).add(partnerId, sessionId, session);
    },

    remove: ({ partnerId, sessionId }, _, { dataSources: { firestore } }) => {
      dlog('delete');
      return sessionStore(firestore).remove(partnerId, sessionId);
    },

    update: (
      { partnerId, sessionId },
      { session },
      { dataSources: { firestore } },
    ) => {
      dlog('update');
      return sessionStore(firestore).update(partnerId, sessionId, session);
    },
  },
};
