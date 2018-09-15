let path = require("path")

module.exports = str => {
	let startedExecutable = path.normalize(path.resolve(process.argv[1]));
	let bundlerMain = path.normalize(path.resolve(path.dirname(__filename), "main.js"));
	if(startedExecutable === bundlerMain){
		console.error(str);
		process.exit(1);
	} else {
		throw new Error(str);
	}
	
}