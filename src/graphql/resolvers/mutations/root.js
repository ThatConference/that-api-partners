const resolvers = {
  partners: (parent, args, { dataSources: { logger } }) => {
    logger.info('root:partners mutation called');
    return {};
  },
};

export default resolvers;
