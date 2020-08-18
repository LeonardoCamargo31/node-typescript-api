import * as path from 'path';
import moduleAlias from 'module-alias';

// not use more require ('../../../../some/very/deep/module')
// with module-alias var module = require('@src/module')

// all files
const files = path.resolve(__dirname, '../..');

// add alias to files
moduleAlias.addAliases({
  '@src': path.join(files, 'src'),
  '@test': path.join(files, 'test'),
});
