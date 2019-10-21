describe('the graphql schema', () => {
  it('will correctly parse all graphql files', () => {
    const theIndex = require('../index').default; // eslint-disable-line
    expect(theIndex).toBeDefined();
  });
});
