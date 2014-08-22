

var http = require("http");
var inline = require("./inline");
inline.compile("www");		

http.createServer(function (request, response){ 		
  inline.navigate(request, response);
}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');

