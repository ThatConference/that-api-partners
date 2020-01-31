/* eslint-disable import/prefer-default-export */
import debug from 'debug';
import partnerStore from '../../../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:partner:mutation');

export const fieldResolvers = {
  PartnerMutation: {
    update: async (
      { partnerId },
      { partner },
      { dataSources: { firestore } },
    ) => {
      dlog('partner update called');
      return partnerStore(firestore).update(partnerId, partner);
    },
    jobListings: ({ partnerId }) => ({ partnerId }),
  },
};
