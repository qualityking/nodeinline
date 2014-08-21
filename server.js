
var onRequest = function (request, response) {

  response.writeHead(200, {"Content-Type": "text/html"});  
  response.end();
}


var http = require("http");
var inline = require("./inline");
inline.compile();		

http.createServer(onRequest).listen(8080);
console.log('Starting server...');
console.log('Server running at http://127.0.0.1:8080/');





