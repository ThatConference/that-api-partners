import debug from 'debug';
import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:mutations:PartnerMutation');

export const fieldResolvers = {
  PartnerMutation: {
    update: (
      { partnerId },
      { partner },
      { dataSources: { firestore }, user },
    ) => {
      dlog('partner update called');
      return partnerStore(firestore).update(partnerId, partner, user);
    },
    changeSlug: (
      { partnerId },
      { newSlug },
      { dataSources: { firestore }, user },
    ) => {
      dlog('changeSlug called');
      return partnerStore(firestore).changeSlug({
        partnerId,
        newSlug,
        user,
      });
    },
    jobListings: ({ partnerId }) => ({ partnerId }),
    member: ({ partnerId }, { id }) => ({ partnerId, memberId: id }),
    session: ({ partnerId }, { id }) => ({ partnerId, sessionId: id }),
  },
};
