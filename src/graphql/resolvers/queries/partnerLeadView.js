export const fieldResolvers = {
  PartnerLeadView: {
    partner: ({ partnerId }, __, { dataSources: { partnerLoader } }) =>
      partnerLoader.load(partnerId),
    event: ({ eventId: id }) => ({ id }),
    member: ({ memberId: id }) => ({ id }),
    partnerContact: ({ partnerContactId: id }) => (id ? { id } : null),
    createdBy: ({ createdBy: id }) => ({ id }),
    lastUpdatedBy: ({ lastUpdatedBy: id }) => ({ id }),
  },
};
