/**
 * Created by john.capehart on 7/31/2016.
 */
global.$;
global.window;
global.document;
global.d3 = require('d3');
global.jquery = require('jquery')
global.ls
var state;

var fs = require('fs');
var jsdom = require("jsdom")

jsdom.env(
    '<html><head></head><body><div class="chart" id="chart"></div><canvas id="canvas"></canvas></body></html>',
    function(err, thewindow) {
        if (err) {
            console.error(err);
            return;
        }
        window = thewindow;
        $ = jquery(window);
        document = window.document;
        ls = require('./node-lindenmayer.js')
        var s = ls.lsystem(3, ['F'], { F:'FF-[-F+F+F]+[+F-F-F]'})
        state = ls.lrender({x:700,y:700}, s, ls.plant(20, 10 * Math.PI/180))

        var svg = d3.select('body');
        fs.writeFile('graph.svg', state.xml);
    });

var http = require('http');
const port = 3000;

const requestHandler = (request, response) => {
    console.log(request.url)
    response.writeHead(200, {'Content-Type': 'image/svg+xml' });
    response.write(state.xml);//send image
    response.end();
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})
