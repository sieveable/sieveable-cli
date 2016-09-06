/* eslint-env node, mocha */
/* eslint no-sync: 0*/
'use strict';
const path = require('path'),
  fs = require('fs'),
  program = require('commander'),
  colors = require('colors'),
  sieveableRequest = require('../lib/sieveable_request');

let resultFile,
  queryFile;

program
  .version(require('../package.json').version)
  .description('Sieveable command line client.')
  .usage('[options] <queryFile> <resultFile>')
  .arguments('<queryFile> <resultFile>')
  .action((qFile, rFile) => {
    queryFile = qFile;
    resultFile = rFile;
  })
  .option('-H, --host <arg>', 'Sieveable\'s server to connect to. Default is localhost')
  .option('-p, --port <n>', 'Sieveable\'s port to connect to. Default is 3000', parseInt)
  .option('-c, --cursor <arg>', 'The next cursor to iterate over the results. Default is *')
  .parse(process.argv);

const host = program.host ? program.host : 'localhost',
  port = program.port ? program.port : 3000,
  cursor = program.cursor ? program.cursor : '*';

fileCheck(queryFile, true);
fileCheck(resultFile, false);

sieveableRequest.search(host, port, fs.readFileSync(path.resolve(queryFile), 'utf8')
                        , path.resolve(resultFile), cursor);

function fileCheck(file, shouldExist) {
  try {
    const stats = fs.statSync(file);
    if (!stats.isFile()) {
      throw new Error(`No such file ${file}`);
    }
    else if (stats && !shouldExist) {
      if (!program.cursor) {
        throw new Error('File already exists. ' +
        'Either use the cursor option to append to the file or use a non-existing file name.');
      }
      return;
    }
  }
  catch (e) {
    if (!shouldExist && e.code === 'ENOENT') {
      return;
    }
    console.error(colors.red(e.message));
    process.exit(1);
  }
}
