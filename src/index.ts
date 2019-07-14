/**
 * 1) Read input files - done
 * 2) fetch data - done
 * 3) write CSV - done
 * 4) CSV to Dir - done
 * 5) Dir to CSV - In progress
 *   a) read Dir - done.
 *   b) read Files - In progress, read the file, got the data back and I am passing the CSV data
 *      as a parameter to compare with the data that I got from the dist folder, but the data I
 *      am passing is a promise<string> and trying to compare it with string[] in a loop as
 *      below: <code snippet>
 *   c) updating existing CSV if there is any new lines of change
 * 6) CSV to Input files update with new domain.
 *
 * ```ts
 * // <code snippet>
 * export const dirtoReport = async (data: Promise<string[]>, distPath: string): Promise<void> => {
 *  // tslint:disable-next-line:prefer-const
 *  let dataArr: any;
 *  await readdirPromise(distPath)
 *    .then((files) => {
 *      files.forEach(async (f) => {
 *        // dist folder robots.txt data
 *        const readfile = await readFilePromise(path.join(distPath, f, '/robots.txt'), 'utf8');
 *        dataArr.push(readfile);
 *      });
 *
 *      dataArr.split('\n').forEach( (line: any, index: number) => {
 *        const lineData =
 *      })
 *  })
 *  .catch((err) => {
 *    console.log(err);
 *  });
 * };
 * ```
 */



import fs from 'fs';
import path from 'path'
import readline from 'readline';
import { promisify } from 'util';

import CSVStringify, { Stringifier } from 'csv-stringify';

const readdirPromise = promisify(fs.readdir);

/**
 * Promise to write each line from a robots.txt file to the common CSV stream.
 */
const robotsToCSVPromise = (domain: string, robotsFilepath: string, csv: Stringifier): Promise<void> => {
  // Increment lineNumber with each 'line' event
  let lineNumber = 0;

  // Create an input stream to access the robots.txt file data
  const input = fs.createReadStream(robotsFilepath, { encoding: 'utf8' });

  // Handle the streams async
  const promise = new Promise<void>((resolve, reject) => {
    const rl = readline.createInterface({ input, crlfDelay: Infinity });

    // For every line read, increment the line counter and write data to the CSV stream
    rl.on('line', (lineData) => {
      lineNumber = lineNumber += 1;
      csv.write({ domain, lineNumber, lineData });
    });

    // Resolve / Reject
    rl.on('close', resolve);
    csv.on('error', (error) => reject(error));
  });

  return promise;
}

/**
 * The common CSV stream object.
 */
const CSVStream = CSVStringify({
  header: true,
  columns: [
    { key: 'domain' },
    { key: 'lineNumber', header: 'line number' },
    { key: 'lineData', header: 'line data' },
  ],
});

// input/output paths
const domainsDir = path.join(__dirname, '..', 'sample');
const reportPath = path.join(__dirname, '..', 'sample-report.csv');

const main = async () => {
  // Create a writable file stream to store the combined robots.txt data
  const CSVFileWriteStream = fs.createWriteStream(reportPath, { encoding: 'utf8' });

  // Connect the output of CSV "stringifier" to the input of the CSV "writer"
  CSVStream.pipe(CSVFileWriteStream);

  // Find all the "domain" name directories; fs.Dirent[]
  const dirents = await readdirPromise(domainsDir, { encoding: 'utf8', withFileTypes: true });

  /**
   * Create an array of promises:
   *
   * 1. Using only directory
   * 2. Create arguments for `robotsToCSVPromise`
   *    e.g. ['www.ajc.com', 'path/to/www.ajc.com/robots.txt']
   * 3. Create the promise to handle the streaming robots.txt data into the common CSV stream
   */
  const promises = dirents
    .filter(dirent => dirent.isDirectory())
    .map(({ name: domain }) => [domain, path.join(domainsDir, domain, 'robots.txt')])
    .map(([ domain, filepath]) => robotsToCSVPromise(domain, filepath, CSVStream));

  // Wait for all the Promises to resolve; ergo the streams have ended
  await Promise.all(promises);
};

main();
