var fs = require('fs');
var path = require('path'); 
var readline = require('readline');
var stream = require('stream');
var webroot = require('./webroot');



var NodeScript = ""; 

function compile(root){
	var filelist = webroot.getFileList(root)
	filelist.forEach(doCompile);
}

function doCompile(fileName) {
 	
	var _newfilename = 'compiled/' + fileName.replace('/','_');
	var j = _newfilename.lastIndexOf('.');
	var extn = _newfilename.substring(j).toLowerCase()
	var newfilename  = _newfilename.replace(extn,".js");			
	
	if (path.existsSync(newfilename)) { 
		fs.unlink(newfilename);
	}
	fs.appendFile(newfilename, "exports.www_index = function www_index(request,response) {");
	
	//setTimeout(function() {
	//}, 10000);
	
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
		
		if(!scripletStart && line!="" && !scripletInlineStart){
			line =  "response.write('"  + line + "'); " + "\n";  
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


exports.compile = compile;



function generateNavigate(filePath){

	var module = require(filePath); 
	
}


