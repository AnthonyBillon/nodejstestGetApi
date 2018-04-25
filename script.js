const args = process.argv.slice(2);
const EventEmitter = require('events');
const https = require('https');

if (args.length > 1) {
    console.log("Arg length error. Exiting");
    process.exit();
}

var options = {
    host: 'jsonmock.hackerrank.com',
    path: '/api/movies/search/?Title='
};

class MoviePageManager extends EventEmitter {
    constructor(i) {
        super();

        let path = options.path+"&page=" + i;
        this.options = {
            host: options.host,
            path: path
        };
        var cb = (response) => {
            var str = '';
            //another chunk of data has been recieved, so append it to `str`
            response.on('data', (chunk) => {

                str += chunk;
            });
            //the whole response has been recieved, so we just print it out here
            response.on('end', () => {
                var obj = JSON.parse(str);
                var titles = [];
                for (var i = 0; i < obj.data.length; i++) titles.push(obj.data[i].Title);
                this.emit("moviedataready", titles);
            });
        }

        https.request(this.options, cb).end();

    }
}

function getFilmList() {
    var arr = [];
    var cp;
    var str = '';


    callback = function (response) {
        response.on('data', function (chunk) {
            str += chunk;
        });

        c = function (o) {
            arr = arr.concat(o);
            cp--;
            if (cp == 0) {
                arr.sort();
                for (var i = 0; i < arr.length; i++) {
                    console.log(arr[i]);
                }
            }
        }
        response.on('end', function () {
            let obj = JSON.parse(str);
            cp = obj.total_pages;
            for (var i = 1; i <= obj.total_pages; i++) {
                var mpm = new MoviePageManager(i);
                mpm.on('moviedataready', c);
            }
        });
    }
    options.path += args[0];
    https.request(options, callback).end();


}

getFilmList();
