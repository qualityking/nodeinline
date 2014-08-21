

var http = require("http");
var inline = require("./inline");
var url = require("url");

inline.compile("www");		

http.createServer(function (request, response){
  navigate(request, response);
  response.writeHead(200, {"Content-Type": "text/html"});  
  response.end();

}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');


function navigate(request, response){

 var pathname = url.parse(request.url).pathname;
 console.log(pathname);
 pathname = "compiled/www_index.js";
 var file = require(pathname);
 //evel();
 file.www_index(request, response);
}



