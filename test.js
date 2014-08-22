var lineReader = require('./line-reader');

lineReader.eachLine('www/index.html', function(line) {
 if(!line=="" && line!=null && line!="\n" && line!="\r" && line!="\l" && line!="\lr"){
	console.log(line);
  }
}).then(function () {
  console.log("I'm done!!");
});