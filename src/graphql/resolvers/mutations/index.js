import rootMutations from './root';

import { fieldResolvers as partnerFields } from './partner';
import { fieldResolvers as partnersFields } from './partners';

import { fieldResolvers as jobListingsFields } from './jobListings';
import { fieldResolvers as jobListingFields } from './jobListing';

import { fieldResolvers as sessionFields } from './session';
import { fieldResolvers as memberFields } from './member';

export default {
  ...rootMutations,
};

export const fieldResolvers = {
  ...partnersFields,
  ...partnerFields,
  ...jobListingsFields,
  ...jobListingFields,
  ...memberFields,
  ...sessionFields,
};
