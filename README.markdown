== get_json_req_resp_from_har

Nodejs utility to get contentType application/json content

== Installation

* Pull down repository
* Install dependencies 

~~~
npm install
~~~

== Run

~~~
nodejs index.js --file=YOUR_HAR_FILE.har --output=WANTED_CSV_FILE_NAM.csv
~~~

== Options available
* -o, --output  // output csv file name
* -f, --file    // har file name

== Todo

* Better design pattern
* Better documentation
* Show --help command
* Implement test
* Add .jshint
* Add validations
* Add benchmarks
* Add .editorconfig

== List of 'improvements'
* Display menu with options
* Better options like:
    1. Display all available response and request information available
    2. Add .json configuration to parse objects
    3. Display 'working' progress bar
* Export to csv only content where url + params are unique.