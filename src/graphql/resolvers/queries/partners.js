import partnerStore from '../../../dataSources/cloudFirestore/partner';

const resolvers = {
  partner: async (parent, { id }, { dataSources }) =>
    partnerStore(dataSources.firestore).get(id),

  partners: async (parent, args, { dataSources }) =>
    partnerStore(dataSources.firestore).getAll(),
};

export default resolvers;

export const refResolvers = {
  Partner: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveReference(partner, { dataSources }) {
      return partnerStore(dataSources.firestore).get(partner.id);
    },
  },
};
