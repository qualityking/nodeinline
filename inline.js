//TODO : runtime compile if source code updated, skip recompile if source code is not updated.
//TODO : dynamic files should be .node instead of .html 

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var stream = require('stream');
var webroot = require('./lib/webroot');
var url = require("url");
var rootdir = "";
var lineReader = require('./lib/line-reader');

exports.rootdir = rootdir;

exports.navigate = function navigate(request, response) {
	var _rootdir = this.rootdir;
	
	var pathname = '.' + url.parse(request.url).pathname;

	if (pathname.toLowerCase() == "./favicon.ico") {
		response.end();
		return;
	}
	else if (pathname == "./") {
		pathname = "./index.node";
	}

	var contentType = setContentType(request,response, pathname);
	
	if (contentType == "cache"){
		//console.log("inside cache");
		response.end();
	}
	else if (contentType == "static") {
		//console.log("inside static"); 
		content = fs.readFileSync(pathname);
		response.end(content);

	} else if (contentType == "dynamic") {
		//console.log("inside dynamic"); 
		pathname = pathname.substring(1);
		var _newfilename = './compiled/' + _rootdir + pathname.replace(/\//g, "_");
		var j = _newfilename.lastIndexOf('.');
		var extn = _newfilename.substring(j).toLowerCase() //TODO : update find extn using path.extname
		var jsfilename = _newfilename.replace(extn, ".js"); // TODO : if extn like string will be in between file it will replace that too and not the last.

		var file = require(jsfilename);
		file.loadPage(request, response);
		response.end("");
	}
}

exports.compile = function compile(root) {
	this.rootdir = root;
	var filelist = webroot.getFileList(root)
		filelist.forEach(doCompile);
}

function doCompile(fileName) {
	console.log("compiling file : ", fileName);

	var _newfilename = 'compiled/' + fileName.replace('/', '_');
	var j = _newfilename.lastIndexOf('.');
	var extn = _newfilename.substring(j).toLowerCase()
		var newfilename = _newfilename.replace(extn, ".js");

	if (path.existsSync(newfilename)) {
		fs.unlink(newfilename);
	}
	fs.appendFile(fileName, '\n');
	fs.appendFile(newfilename, "exports.loadPage = function (request,response) {");

	var scripletStart = false;
	var scripletInlineStart = false;

	lineReader.eachLine(fileName, function (line) {

		if (!line == "" && line != null && line != "\n" && line != "\r" && line != "\l" && line != "\lr") {

			line = line.replace(/^\s+|\s+$/g, '');

			if (line.indexOf("<?=") > -1) {
				scripletInlineStart = true;
				line = line.replace("<?=", "' + ");
			}

			if (line.indexOf("<?") > -1) {
				scripletStart = true;
				line = line.replace("<?", "");
			}

			if (line.indexOf("?>") > -1) {
				if (scripletInlineStart) {
					scripletInlineStart = false;
					line = line.replace("?>", "+ '");
				} else {
					scripletStart = false;
					line = line.replace("?>", "");
				}
			}

			if (!scripletStart && !scripletInlineStart) {
				if (!line == "") {
					line = "response.write('" + line + "'); " + "\n";
				}
			} else {
				line = line + "\n";
			}
			fs.appendFile(newfilename, line);
		}
	}).then(function () {
		fs.appendFile(newfilename, '}');
	});


}


function setContentType(request, response, pathname) {
	var extname = path.extname(pathname);
	var headercode = 200; 

	if(extname!='.node') {
		var reqModDate = request.headers["if-modified-since"];
		if(!fs.existsSync(pathname)){
			response.writeHead(404, {'Content-Type' : extensions[extname]});
			console.log("404 : ", pathname);
			response.end(); return ""; 
		}
		var stats = fs.statSync(pathname);
		var mtime = stats.mtime;
		var size = stats.size;

		
		if (reqModDate!=null || reqModDate!='undefined') {		
			reqModDate = new Date(reqModDate);
		    if(reqModDate.getTime()==mtime.getTime()) {
			   console.log("load from cache");
			   headercode = 304;
			   
			}
		}
		response.writeHead(headercode, {'Content-Type' : extensions[extname],
										'Last-Modified': mtime.toUTCString()
		});		
		

	}			 
    else {          
		response.writeHead(headercode, {'Content-Type' : extensions[extname]});
	}
	
	if(extname=='.node'){return 'dynamic';}
	else if (headercode==304){return 'cache';}
	else if (headercode==200){return 'static';}
}


extensions = {
	".node" : "text/html",
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"
};