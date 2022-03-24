import root from './root';

import { fieldResolvers as partnersFields } from './partners';
import { refResolvers as parterRefResolvers } from './partner';
import { fieldResolvers as mePartnerFeilds } from './mePartner';
import { fieldResolvers as mePartnerFavFields } from './mePartnerFavorites';
import { fieldResolvers as mePartnerLeadsFields } from './mePartnerLeads';
import { fieldResolvers as usPartnerFields } from './usPartner';
import { fieldResolvers as usPartnerLeadsFields } from './usPartnerLeads';
import { fieldResolvers as partnerLeadViewFields } from './partnerLeadView';
import { fieldResolvers as memberLeadViewFields } from './memberLeadView';
import { fieldResolvers as publicProfileFields } from './extended-publicProfile';
import { fieldResolvers as profileFields } from './extended-profile';
import { fieldResolvers as acceptedSessionFields } from './extended-acceptedSession';
import { fieldResolvers as jobListingQueryFields } from './jobListing';
import { fieldResolvers as communityFields } from './community';

export default {
  ...root,
};

export const fieldResolvers = {
  ...parterRefResolvers,
  ...partnersFields,
  ...mePartnerFeilds,
  ...mePartnerFavFields,
  ...mePartnerLeadsFields,
  ...usPartnerFields,
  ...usPartnerLeadsFields,
  ...partnerLeadViewFields,
  ...memberLeadViewFields,
  ...publicProfileFields,
  ...profileFields,
  ...acceptedSessionFields,
  ...jobListingQueryFields,
  ...communityFields,
};
