export const fieldResolvers = {
  MePartnerMutation: {
    leads: ({ partnerId, slug }) => ({ partnerId, slug }),
  },
};
