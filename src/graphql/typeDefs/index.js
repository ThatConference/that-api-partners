import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

const typesArray = loadFilesSync(path.join(__dirname, './**/*.graphql'), {
  recursive: true,
});

const mergedTypes = mergeTypeDefs([typesArray], { all: true });

export default mergedTypes;
