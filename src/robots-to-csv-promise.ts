import fs from 'fs';
import readline from 'readline';
import { Stringifier } from 'csv-stringify';

/**
 * Promise to write each line from a robots.txt file to the common CSV stream.
 */
export const robotsToCSVPromise = (domain: string, robotsFilepath: string, csv: Stringifier): Promise<void> => {
  // Increment lineNumber with each 'line' event
  let lineNumber = 0;

  // Create an input stream to access the robots.txt file data
  const input = fs.createReadStream(robotsFilepath, { encoding: 'utf8' });

  // Handle the streams async
  const promise = new Promise<void>((resolve, reject) => {
    const rl = readline.createInterface({ input, crlfDelay: Infinity });

    // For every line read, increment the line counter and write data to the CSV stream
    rl.on('line', (lineData) => {
      lineNumber += 1;
      csv.write({ domain, lineNumber, lineData });
    });

    // Resolve / Reject
    rl.on('close', resolve);
    csv.on('error', (error) => reject(error));
  });

  return promise;
}
