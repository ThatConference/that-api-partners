import debug from 'debug';

import partnerStore from '../../../dataSources/cloudFirestore/partner';
import partnerFindBy from '../../../lib/partnerFindBy';
import isPartnerMember from '../../../lib/isPartnerMember';

const dlog = debug('that:api:partners:query:partners');

export const fieldResolvers = {
  PartnersQuery: {
    all: (_, __, { dataSources }) => {
      dlog('all');
      return partnerStore(dataSources.firestore).getAll();
    },

    partner: (_, { findBy }, { dataSources: { firestore } }) => {
      dlog('partner');
      return partnerFindBy(findBy, firestore).then(d =>
        partnerStore(firestore).get(d.partnerId),
      );
    },

    me: () => {
      dlog('me called');
      return {};
    },

    us: async (_, { findBy }, { dataSources: { firestore }, user }) => {
      dlog('us called %o', findBy);
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
