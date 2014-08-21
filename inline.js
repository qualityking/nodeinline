var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var NodeScript = ""; 

function compile() {
 	
	var instream = fs.createReadStream('./nodeapp/www/index.html');
		
	var scripletStart= false; 
	var scripletInlineStart= false; 
	
	
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
			NodeScript = NodeScript + "response.write('"  + line + "'); " + "\n";  
		}
		else {
			NodeScript = NodeScript + line + "\n"; 
		}
		fs.appendFile('./nodeapp/compiled/message.txt', line);
	}
				
		
	});		
	
	//console.log(NodeScript);
	
	//console.log(NodeScript);
	//rl = null; 
	//instream = null; 
}
exports.compile = compile;



