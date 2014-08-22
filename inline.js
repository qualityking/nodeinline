//TODO : runtime compile if source code updated, skip recompile if source code is not updated.
//TODO : dynamic files should be .node instead of .html 

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var stream = require('stream');
var webroot = require('./webroot');
var url = require("url");
var rootdir = "";
var lineReader = require('./line-reader');

exports.rootdir = rootdir;

exports.navigate = function navigate(request, response) {
	var _rootdir = this.rootdir;
	var pathname = url.parse(request.url).pathname;

	if (pathname.toLowerCase() == "/favicon.ico") {
		return;
	}

	var contentType = contentTypeRequest(response, pathname);
	//console.log(contentType);

	if (contentType == "static" || contentType == "binary") {
		pathname = "." + pathname;
		fs.readFile(pathname, function (error, content) {
			if (error) {
				response.writeHead(500);
				response.end();
			} else {
				if (contentType == "static") {
					response.end(content, 'utf-8');
				} else {
					response.end(content, 'binary');
				}

			}
		});

	} else {
		if (pathname == "/") {
			pathname = "/index.html";
		}

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

function contentTypeRequest(response, filePath) {
	var extname = path.extname(filePath);
	extname = extname.replace('.', '');
	var contentType = 'text/html';
	var returnType = "static";
	if (extname.toLowerCase() == "html" || extname.toLowerCase() == "htm" || filePath == "/") {
		response.writeHead(200, {
			'Content-Type' : contentType
		});
		return 'dynamic';
	}
	switch (extname) {
	case '.js':
		contentType = 'text/javascript';
		break;
	case '.css':
		contentType = 'text/css';
		break;
	case '.jpg':
		contentType = 'image/jpeg';
		returnType = "binary";
		break;	
	default:
		contentType = 'image/' + extname;
		returnType = "binary";
		break;
	}
	response.writeHead(200, {'Content-Type' : contentType});
	return 'static';
}

extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg"
};