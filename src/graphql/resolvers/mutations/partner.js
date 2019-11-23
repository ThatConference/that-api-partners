import partnerStore from '../../../dataSources/cloudFirestore/partner';

const resolvers = {
  createPartner: async (parent, { partner }, { dataSources }) =>
    partnerStore(dataSources.firestore).create(partner),
  updatePartner: async (parent, { id, partner }, { dataSources }) =>
    partnerStore(dataSources.firestore).update(id, partner),
};

export default resolvers;
