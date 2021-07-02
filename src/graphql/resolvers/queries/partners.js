import debug from 'debug';
import { dataSources } from '@thatconference/api';

import partnerStore from '../../../dataSources/cloudFirestore/partner';
import partnerFindBy from '../../../lib/partnerFindBy';
import isPartnerMember from '../../../lib/isPartnerMember';

const dlog = debug('that:api:partners:query:partners');
const { member: memberStore } = dataSources.cloudFirestore;

export const fieldResolvers = {
  PartnersQuery: {
    all: (_, __, { dataSources: { firestore } }) => {
      dlog('all');
      return partnerStore(firestore).getAll();
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

    us: async (_, __, { dataSources: { firestore }, user }) => {
      dlog('us called');
      // Get member's activePartnerId
      const member = await memberStore(firestore).get(user.sub);
      if (!member.activePartnerId)
        throw new Error('Active partner id not set for logged in member.');

      const { partnerId, slug } = await partnerFindBy(
        { id: member.activePartnerId },
        firestore,
      );
      if (!partnerId)
        throw new Error(
          'partner reference (member.activePartnerId) not found.',
        );
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
