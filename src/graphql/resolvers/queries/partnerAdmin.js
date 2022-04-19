import debug from 'debug';
import partnerMemberStore from '../../../dataSources/cloudFirestore/members';

const dlog = debug('that:api:partners:query:partnerAdmin');

export const fieldResolvers = {
  PartnerAdminQuery: {
    members: ({ partnerId }, __, { dataSources: { firestore } }) => {
      dlog('retieving members for partner %s', partnerId);
      return partnerMemberStore(firestore).findPartners(partnerId);
    },
  },
};
