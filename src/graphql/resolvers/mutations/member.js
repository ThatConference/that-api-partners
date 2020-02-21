import debug from 'debug';

import memberStore from '../../../dataSources/cloudFirestore/members';

const dlog = debug('that:api:partners:mutations:PartnerMembersMutation');

export const fieldResolvers = {
  PartnerMemberMutation: {
    add: (
      { partnerId, memberId },
      { member },
      { dataSources: { firestore } },
    ) => {
      dlog('create');
      return memberStore(firestore).add(partnerId, memberId, member);
    },

    remove: ({ partnerId, memberId }, _, { dataSources: { firestore } }) => {
      dlog('delete');
      return memberStore(firestore).remove(partnerId, memberId);
    },

    update: (
      { partnerId, memberId },
      { member },
      { dataSources: { firestore } },
    ) => {
      dlog('update');
      return memberStore(firestore).update(partnerId, memberId, member);
    },
  },
};
