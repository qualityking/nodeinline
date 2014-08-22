var fs = require('fs');
var path = require('path'); 
var readline = require('readline');
var stream = require('stream');
var webroot = require('./webroot');
var url = require("url");
var rootdir = ""; 

exports.rootdir = rootdir; 

exports.navigate = function navigate(request, response){
 var _rootdir = this.rootdir; 
 var pathname = url.parse(request.url).pathname; 
 var jsfilename = "";	
	
	if(pathname.toLowerCase()=="/favicon.ico"){
		return; 
	}
	else if(pathname=="/" || pathname.toLowerCase()=="index.htm" || pathname.toLowerCase()=="index.html") {
		jsfilename = "./compiled/"+ _rootdir +"_index.js";
	}else{
		var _newfilename = './compiled/'+ _rootdir + pathname.replace(/\//g, "_");
		var j = _newfilename.lastIndexOf('.');
		var extn = _newfilename.substring(j).toLowerCase()
		jsfilename = _newfilename.replace(extn,".js");	
	}
	if (path.existsSync(jsfilename)) { 
		var file = require(jsfilename);
		file.loadPage(request, response);
		response.end("");
	}else {
		console.log("404 file not found : ", pathname);
		response.end("");
	}
	 
}


exports.compile = function compile(root){
	this.rootdir = root;
	var filelist = webroot.getFileList(root)
	filelist.forEach(doCompile);
}

function doCompile(fileName) {
 	console.log("compiling file : ", fileName);
	
	var _newfilename = 'compiled/' + fileName.replace('/','_');
	var j = _newfilename.lastIndexOf('.');
	var extn = _newfilename.substring(j).toLowerCase()
	var newfilename  = _newfilename.replace(extn,".js");			
	
	if (path.existsSync(newfilename)) { 
		fs.unlink(newfilename);
	}
	fs.appendFile(fileName, '\n');
	fs.appendFile(newfilename, "exports.loadPage = function (request,response) {");
	

	var scripletStart= false; 
	var scripletInlineStart= false; 
	
	var instream = fs.createReadStream(fileName);
	
	var rl = readline.createInterface({
		input: instream,
		terminal: false
	});
	
	
	rl.on('line', function(line) {
	if(line!=""){
		
		line = line.replace(/^\s+|\s+$/g,''); 
		
		if(line.indexOf("<?=") > -1){
			scripletInlineStart= true; 
			line = line.replace("<?=","' + "); 
		}
		
		if(line.indexOf("<?") > -1){
			scripletStart= true; 
			line = line.replace("<?",""); 
		}
		
		if(line.indexOf("?>") > -1){
			if(scripletInlineStart){
				scripletInlineStart = false; 
				line = line.replace("?>","+ '"); 
			}
			else {
			scripletStart= false; 
			line = line.replace("?>",""); 
			}
		}
		
		if(!scripletStart && !scripletInlineStart){
			if(!line==""){
				line =  "response.write('"  + line + "'); " + "\n";  
			}		
		}
		else {
			line =  line + "\n"; 
		}
		fs.appendFile(newfilename, line);
	}
				
		
	});		
	
	rl.on('close', function(line) {
		fs.appendFile(newfilename, '}');
	});

}


