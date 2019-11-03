import faker from 'faker';

import partner, { queries as partnerQueries } from './partner';
import jobListing from './jobListing';

const mocks = {
  URL: () => faker.internet.url(),
  PhoneNumber: () => faker.phone.phoneNumber(),
  PostalCode: () => faker.address.zipCode(),
  Partner: partner,
  JobListing: jobListing,

  Query: () => ({
    ...partnerQueries(),
  }),
};

export default () => mocks;
