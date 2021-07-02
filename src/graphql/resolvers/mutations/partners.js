import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';
import partnerFindBy from '../../../lib/partnerFindBy';
import isPartnerMember from '../../../lib/isPartnerMember';

const dlog = debug('that:api:partners:mutations:PartnersMutation');

export const fieldResolvers = {
  PartnersMutation: {
    create: (_, { partner }, { dataSources: { firestore }, user }) => {
      dlog('create');
      return partnerStore(firestore).create(partner, user);
    },

    delete: () => {
      dlog('delete');
      throw new Error('Not Implemented yet.');
    },

    partner: (_, { findBy }, { dataSources: { firestore } }) => {
      dlog('partner called %o', findBy);
      return partnerFindBy(findBy, firestore);
    },

    favoriting: (_, { findBy }, { dataSources: { firestore } }) => {
      dlog('favoriting called');
      return partnerFindBy(findBy, firestore);
    },

    us: async (_, { findBy }, { dataSources: { firestore }, user }) => {
      dlog('us called');
      // return partnerFindBy(findBy, firestore);
      dlog('us called');
      const { partnerId, slug } = await partnerFindBy(findBy, firestore);
      if (!partnerId) throw new Error('partner reference not found');
      const is = await isPartnerMember({
        partnerId,
        memberId: user.sub,
        firestore,
      });
      if (!is) return {};
      return { partnerId, slug };
    },
  },
};
