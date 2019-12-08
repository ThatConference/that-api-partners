import partners, { refResolvers as parterRefResolvers } from './partners';

export default {
  ...partners,
};

export const fieldResolvers = {
  ...parterRefResolvers,
};
