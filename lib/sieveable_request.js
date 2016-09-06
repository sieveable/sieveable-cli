'use strict';
const _ = require('lodash'),
  fs = require('fs'),
  //sleep = require('sleep'),
  request = require('request');

exports.search = function search(host, port, queryText, resultFile, cursor) {
  const url = `http://${host}:${port}/q`,
    reqObj = {
      url,
      qs: {
        queryText,
      }
    };
  fs.appendFileSync(resultFile, '[');
  doCursorIteration(reqObj, cursor, resultFile, () => {
    console.log('The response has been saved at', resultFile);
  });
};
let count = 0;
function doCursorIteration(reqObj, cursor, resultFile, callback) {
  querySieveable(reqObj, cursor, resultFile, (nextCursor) => {
    if (nextCursor !== cursor) {
      // Wait for 10 seconds before the next request.
      count = count + 1;
      console.log(`Request#${count}\n${cursor}`);
      //sleep.sleep(10);
      doCursorIteration(reqObj, nextCursor, resultFile, callback);
    }
    else {
      callback();
    }
  });
}

function querySieveable(reqObj, cursor, resultFile, callback) {
  const options = reqObj;
  options.qs.cursor = cursor;
  return request(options, (error, response, body) => {
    const parsed = JSON.parse(body),
      nextCursor = parsed.cursor;
    _.forEach(parsed.apps, (resObj) => {
      fs.appendFileSync(resultFile, `${JSON.stringify(resObj)},\n`);
    });
    callback(nextCursor);
  });
}
