var static = require('node-static');
var http = require('http');
var port = 8080;

var fileServer = new static.Server('../app');

http.createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(port);

console.log("static server listening to port ", port);
