import root from './root';

import { fieldResolvers as partnersFields } from './partners';
import { refResolvers as parterRefResolvers } from './partner';

export default {
  ...root,
};

export const fieldResolvers = {
  ...parterRefResolvers,
  ...partnersFields,
};
