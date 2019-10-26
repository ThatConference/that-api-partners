import partnerStore from '../../../dataSources/cloudFirestore/partner';

const resolvers = {
  createPartner: async (parent, { partner }, { dataSources }) =>
    partnerStore(dataSources.firestore).create(partner),
};

export default resolvers;
