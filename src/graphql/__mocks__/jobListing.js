import uuid from 'uuid/v4';
import faker from 'faker';

const mockListing = () => ({
  __typename: 'JobListing',
  id: uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  role: faker.lorem.word(),
});

const mockQueries = () => ({});

export default mockListing;
export const queries = mockQueries;
