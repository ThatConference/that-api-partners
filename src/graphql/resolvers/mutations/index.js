import rootMutations from './root';

import {
  fieldResolvers as partnersFields,
  fieldResolvers as partnerFields,
} from './partners';

import { fieldResolvers as jobListingsFields } from './jobListings';
import { fieldResolvers as jobListingFields } from './jobListing';

export default {
  ...rootMutations,
};

export const fieldResolvers = {
  ...partnersFields,
  ...partnerFields,
  ...jobListingsFields,
  ...jobListingFields,
};
