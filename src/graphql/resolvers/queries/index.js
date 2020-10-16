import root from './root';

import { fieldResolvers as partnersFields } from './partners';
import { refResolvers as parterRefResolvers } from './partner';

import { fieldResolvers as mePartnerFeilds } from './mePartner';
import { fieldResolvers as mePartnerFavFields } from './mePartnerFavorites';

export default {
  ...root,
};

export const fieldResolvers = {
  ...parterRefResolvers,
  ...partnersFields,
  ...mePartnerFeilds,
  ...mePartnerFavFields,
};
