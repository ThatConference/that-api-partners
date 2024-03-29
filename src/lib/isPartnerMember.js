import debug from 'debug';
import { GraphQLError } from 'graphql';
import partnerMemberStore from '../dataSources/cloudFirestore/members';

const dlog = debug('that:api:partners:isPartnerMember');

export default function isPartnerMember({ partnerId, memberId, firestore }) {
  dlog('isPartnerMember called, partner: %s, member %s', partnerId, memberId);

  return partnerMemberStore(firestore)
    .findMemberAtPartner({
      partnerId,
      memberId,
    })
    .then(contact => {
      if (!contact)
        throw new GraphQLError('Member is not assigned to partner', {
          extensions: { code: 'UNAUTHENTICATED' },
        });

      return true;
    });
}
