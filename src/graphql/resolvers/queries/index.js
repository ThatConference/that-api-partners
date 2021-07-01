import root from './root';

import { fieldResolvers as partnersFields } from './partners';
import { refResolvers as parterRefResolvers } from './partner';
import { fieldResolvers as mePartnerFeilds } from './mePartner';
import { fieldResolvers as mePartnerFavFields } from './mePartnerFavorites';
import { fieldResolvers as mePartnerLeadsFields } from './mePartnerLeads';
import { fieldResolvers as partnerLeadViewFields } from './partnerLeadView';
import { fieldResolvers as memberLeadViewFields } from './memberLeadView';

export default {
  ...root,
};

export const fieldResolvers = {
  ...parterRefResolvers,
  ...partnersFields,
  ...mePartnerFeilds,
  ...mePartnerFavFields,
  ...mePartnerLeadsFields,
  ...partnerLeadViewFields,
  ...memberLeadViewFields,
};
