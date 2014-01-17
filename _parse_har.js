module.exports = function() {
    var fs = require('fs'),
        _ = require('underscore')._,
        // readline = require('readline'),
        Work = {},

        /**
         * Not sure about this options but should work for now
         * @type {Object}
         */
        fileOptions = {
            '-o': '-o',
            '--output': '--output',
            '-f': '-f',
            '--file': '--file'
        },
        data, entries, fileOutputName, harFile;

    /**
     * Function to read params and store file's names
     */
    Work.init = function() {

        /**
         * Input args like: --o or --f
         */
        var args = process.argv;

        /**
         * splice because first params are: nodejs and index.js
         */
        args.splice(2).forEach(function(val, index, array) {
            var opt = val.split('='),
                key = opt[0];

            if (!key && !fileOptions[key.toLowerCase()]) {
                return;
            }
            if (!opt[1]) {
                return;
            }
            switch (key) {
                case '-o':
                case '--output':
                    fileOutputName = opt[1];
                    break;
                case '-f':
                case '--file':
                    harFile = opt[1];
            }

        });

        // var line = readline.createInterface(process.stdin, process.stdout);

        // line.setPrompt('guess > Name of the har file with/without .har extension: ');
        // line.prompt();
        // line.on('line', function(input) {
        //     if (!input.split('.')[1]) {
        //         input += '.har';
        //     }
        //     if (Work.checkFile(input)) {
        //         line.close();

        //     }

        //     line.prompt();
        // }).on('close', function() {
        //     process.exit(0);
        // });
        fs.readFile(harFile, function(err, data) {
            if (err) {
                return console.log(err);
            }
            result = JSON.parse(data);
            entries = result.log.entries;

            /**
             * Call a function to work with current file content
             */
            Work.parseHar(entries);
        });
    };

    /**
     * Check if file name exist
     * @param  {String} fileName .har file
     * @return {Boolean}          true if file exist
     */
    Work.checkFile = function(fileName) {
        fs.exists(fileName, function(exist) {
            if (!exist) {
                console.log('File with name: ' + fileName + ' doesnt exist \n');
            }
            return exist;
        });
    };

    /**
     * Store only request with contentType = json,
     * @param  {Object} entries Array of objects(request and response object)
     */
    Work.parseHar = function(entries) {
        var opts = [],
            types = {
                'application/json': 'application/json'
            };

        entries.forEach(function(entry) {
            var responseType = entry.response.content.mimeType;

            if (entry.request.method == 'OPTIONS') {
                return;
            }

            return types[responseType] ? opts.push(entry) : '';

        });
        Work.cleanHar(opts);
    };

    /**
     * From the request we need:
     *     method       request.method
     *     url          request.url
     *     queryString  request.queryString
     *
     * From the response we need:
     *     status       response.status
     *     json         response.content.text
     */
    Work.cleanHar = function(entries) {

        var result = [],
            store = {},
            csv = [];

        entries.forEach(function(entry) {
            var query = entry.request.postData,
                url = entry.request.url,
                object, pairs, first;

            url = url.split('?');
            var tmpUrl = url[0];

            if (url[1]) {
                url[1].split('&').map(function(i) {
                    var key = i.split('=')[0];
                    if (key && key == 'base') {
                        tmpUrl = i.split('=')[1];
                    }
                });
            }

            if (query) {
                query = JSON.stringify(query.text);
            } else {
                var tmpQuery = [];

                entry.request.queryString.forEach(function(q) {
                    var values = _.values(q);
                    if (values[0] != 'apiKey' && values[0] != 'hash' && values[0] != 'time') {
                        return tmpQuery.push(_.values(q).join('='));
                    }
                });
                query = tmpQuery.join(',');
            }

            // if(store[url + query]){
            //     return;
            // } 

            // store[url + query ] = url + query;

            object = {
                api_call: tmpUrl,
                query: query,
                method: entry.request.method,
                destination: entry.request.url,
                status: entry.response.status,
                response: entry.response.content.text || ''
            };

            try {
                object.response = JSON.parse(object.response);

                pairs = _.pairs(object.response);
                first = pairs[0];
                if (_.isArray(first[1])) {
                    object.response = JSON.stringify(first[1][0]);
                } else {
                    object.response = JSON.stringify(object.response);
                }

            } catch (e) {
                object.response = JSON.stringify(object.response);
                console.log('Cannot parse the response because: ', e);
                console.log("\nAdding as response: ", object.response);
            }
            csv.push(_.values(object).join('~') + '\n');
        });

        /**
         * Write a 'csv' to file or default result.csv
         */
        fs.writeFile(fileOutputName || 'result.csv', csv, function() {
            console.log("\nEend of process information...");
        });
    };

    return Work;
};