var fs = require('fs');

function getFiles(dir, files_) {
	files_ = files_ || [];
	if (typeof files_ === 'undefined')
		files_ = [];
	var files = fs.readdirSync(dir);
	for (var i in files) {
		if (!files.hasOwnProperty(i))
			continue;
		var name = dir + '/' + files[i];
		if (fs.statSync(name).isDirectory()) {
			if (files[i].charAt(0) == ".")
				continue;
			getFiles(name, files_);
		} else {
			var j = files[i].lastIndexOf('.');
			if (j > 0) {
				if (files[i].substring(j).toLowerCase() == '.node') {
					files_.push(name);
				}
			}
		}
	}

	return files_;
}

exports.getFileList = getFiles;
