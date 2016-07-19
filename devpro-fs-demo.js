"use strict";

const fs = require('fs');
const http = require('http');

const url = require('url');
const path = require('path');


const server = http.createServer((req, res) => {
	const data = url.parse(req.url, true);

	if (req.url  === '/favicon.ico') {
		// тяжелый вздох
		res.statusCode = 204;
		res.end();
		return;
	}

	const dir = data.query.path || '/';

	fs.readdir(dir, (err, data) => {
		if (err) {
			res.statusCode = 500;
			res.end(err.toString());
			return;
		}

        var promises = data.map(file => {
            let result = { name: file };

            try {
                return new Promise((resolve, reject) => {
                    fs.stat(path.join(dir, file), (err, stats) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(Object.assign(result, { isDirectory: stats.isDirectory() }));
                    });
                });

            } catch (e) {
                return Promise.resolve(result);
            }
        });

        Promise.all(promises)
            .then(files => {
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify(files));
            });
	});

});

server.listen(3000);

