import CSVStringify from 'csv-stringify';

/**
 * The common CSV stream object.
 */
export const CSVStream = CSVStringify({
  header: true,
  columns: [
    { key: 'domain' },
    { key: 'lineNumber', header: 'line number' },
    { key: 'lineData', header: 'line data' },
  ],
});
