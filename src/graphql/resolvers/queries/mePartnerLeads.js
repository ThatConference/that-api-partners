import debug from 'debug';
import leadStore from '../../../dataSources/cloudFirestore/leads';

const dlog = debug('that:api:partners:query:me:leads');

export const fieldResolvers = {
  MePartnerLeadsQuery: {
    all: (_, __, { dataSources: { firestore }, user }) => {
      dlog('all called me: %s', user.sub);
      return leadStore(firestore)
        .findByMember(user.sub)
        .then(leads => leads);
    },
  },
};
