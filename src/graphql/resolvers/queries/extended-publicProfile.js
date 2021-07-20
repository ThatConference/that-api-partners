export const fieldResolvers = {
  PublicProfile: {
    isCompanyContact: ({ isCompanyContact }) => isCompanyContact === true,
    isPrimaryContact: ({ isPrimaryContact }) => isPrimaryContact === true,
    isSponsoredFeatured: ({ isSponsoredFeatured }) =>
      isSponsoredFeatured === true,
    isSponsoredSpeaker: ({ isSponsoredSpeaker }) => isSponsoredSpeaker === true,
    isPartnershipContact: ({ isPartnershipContact }) =>
      isPartnershipContact === true,
  },
};
