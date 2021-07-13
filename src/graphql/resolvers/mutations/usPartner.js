export const fieldResolvers = {
  UsPartnerMutation: {
    leads: ({ partnerId, slug }) => ({ partnerId, slug }),
  },
};
