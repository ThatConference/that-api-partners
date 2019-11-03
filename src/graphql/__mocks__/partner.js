import uuid from 'uuid/v4';
import faker from 'faker';
import moment from 'moment';

const mockPartner = () => ({
  __typename: 'Partner',
  id: uuid(),
  year: moment().year,
  companyName: faker.company.companyName(),
  goals: ['just', 'be', 'awesome'],
  aboutUs: faker.company.catchPhrase(),
  addressLineOne: faker.address.streetAddress(),
  addressLineTwo: faker.address.secondaryAddress(),
  city: faker.address.city(),
  state: faker.address.state(),
});

const mockQueries = () => ({
  partners: () => {
    const results = [];

    while (results.length < 40) {
      results.push(mockPartner());
    }

    return results;
  },
});

export default mockPartner;
export const queries = mockQueries;
