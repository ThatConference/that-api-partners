import partnerStore from '../../../dataSources/cloudFirestore/partner';

const resolvers = {
  partner: async (parent, { id }, { dataSources }) =>
    partnerStore(dataSources.firestore).get(id),

  partners: async (parent, args, { dataSources }) =>
    partnerStore(dataSources.firestore).getAll(),
};

export default resolvers;
