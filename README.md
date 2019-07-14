# Lakshmi Example

```Gherkin
GIVEN: There are many "domain" directories, each containing a "robots.txt" file i.e. `dir/${domain}/robots.txt`
THEN: prepare a single CSV object with headers: `domain,line number,line data`
AND: For every "domain" directory; get every line of each "robot.txt" file
AND: aggregate file data into a single CSV object
AND: save the single CSV object as a CSV file
```

## Install

```sh
git clone git@github.com:sframe/lakshmi-example.git
cd lakshmi-example
npm i
```

## Create a sample report

```sh
npm run sample-report
cat sample-report.csv
```
