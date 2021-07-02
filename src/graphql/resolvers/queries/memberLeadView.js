export const fieldResolvers = {
  MemberLeadView: {
    partner: ({ partnerId }, __, { dataSources: { partnerLoader } }) =>
      partnerLoader.load(partnerId),
    event: ({ eventId: id }) => ({ id }),
    member: ({ memberId: id }) => ({ id }),
    partnerContact: ({ partnerContactId: id }) => ({ id }),
    createdBy: ({ createdBy: id }) => ({ id }),
    lastUpdatedBy: ({ lastUpdatedBy: id }) => ({ id }),
  },
};
