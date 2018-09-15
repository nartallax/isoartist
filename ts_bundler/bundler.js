let path = require("path");

let tsc = require("./tsc"),
	fail = require("./fail"),
	fs = require("./fs"),
	modname = require("./modname"),
	
	DependencyTraverser = require("./dependency_traverser"),
	discoverPackages = require("./discover_packages"),
	separateCode = require("./code_separator"),
	minifyCode = require("./code_minifier");

module.exports.getBundleCode = async (opts) => {
	await tsc.run(opts.tsConfigPath, {
		"project": `${JSON.stringify(opts.tsConfigPath)}`,
		"target": opts.fancy? "es2018": "es5"
	});
	
	let paths = await discoverPackages(opts.tsConfigPath);
	let deps = await (new DependencyTraverser(paths).getFullDependencyList(opts.entryPoint));
	let content = await Promise.all(deps.map(async x => [x, await fs.readFile(paths[x])]));
	
	let commons = {};
	content.forEach(x => {
		let [newCommons, cleanCode] = separateCode(x[1]);
		x[1] = opts.fancy? cleanCode: minifyCode(cleanCode);
		Object.keys(newCommons)
			.filter(x => (x in commons) && commons[x] !== newCommons[x])
			.forEach(x => fail("Inconsistent common code piece \"" + x + "\"."))
		commons = Object.assign(commons, newCommons);
	});
	let commonsCode = Object.keys(commons).map(x => commons[x]).join("");
	
	let runner = await fs.readFile(path.resolve(__dirname, "./client_code/runner.js"));
	let evalCode = await fs.readFile(path.resolve(__dirname, "./client_code/eval.js"));
	let modnameCode = modname.getCodeObject();
	
	let resultCode = commonsCode + runner + "(" + [
		JSON.stringify(content),
		modnameCode, 
		evalCode,
		JSON.stringify(opts.entryPoint),
		JSON.stringify(opts.entryPointFunction)
	].join(",") + ")";
	
	return resultCode;
}