export const fieldResolvers = {
  AcceptedSession: {
    isSponsored: ({ isSponsored }) => isSponsored === true,
  },
};
