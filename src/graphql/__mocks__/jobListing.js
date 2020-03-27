import { v4 as uuidv4 } from 'uuid';
import faker from 'faker';

const mockListing = () => ({
  __typename: 'JobListing',
  id: uuidv4(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  role: faker.lorem.word(),
});

const mockQueries = () => ({});

export default mockListing;
export const queries = mockQueries;
