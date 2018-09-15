let fail = require("./fail");

let findArgVal = (onNotFound, names) => {
	let nameSet = new Set(names);
	let index = 0;
	for(let i = 2; i < process.argv.length; i++){
		let x = process.argv[i];
		if(nameSet.has(x)){
			if(i === process.argv.length - 1)
				fail("Expected value after command-line key " + x);
			if(index)
				fail("Only one of " + names.join(", ") + " command-line keys expected.");
			else
				index = ++i;
		}
	}
	if(!index)
		return onNotFound();
	return process.argv[index];
}

module.exports.cliArgOrDefault = (dflt, ...names) => findArgVal(() => dflt, names)

module.exports.cliArg = (...names) => findArgVal(() => fail("Expected at least one of: " + names.join(", ")), names);

module.exports.cliArgBool = (...names) => {
	let nameSet = new Set(names);
	let has = false;
	for(let i = 2; i < process.argv.length; i++){
		let x = process.argv[i];
		if(nameSet.has(x)){
			if(has)
				fail("Only one of " + names.join(", ") + " command-line keys expected.");
			else
				has = true;
		}
	}
	return has;
}