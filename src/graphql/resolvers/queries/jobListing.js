export const fieldResolvers = {
  JobListing: {
    partner: ({ partnerId }, __, { dataSources: { partnerLoader } }) =>
      partnerLoader.load(partnerId),
  },
};
