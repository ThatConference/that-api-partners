import debug from 'debug';
import { dataSources } from '@thatconference/api';

import partnerStore from '../../../dataSources/cloudFirestore/partner';
import partnerFindBy from '../../../lib/partnerFindBy';
import isPartnerMember from '../../../lib/isPartnerMember';

const dlog = debug('that:api:partners:mutations:PartnersMutation');
const { member: memberStore } = dataSources.cloudFirestore;

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

    me: (_, { findBy }, { dataSources: { firestore } }) => {
      dlog('me called %o', findBy);
      return partnerFindBy(findBy, firestore);
    },
  },
};
