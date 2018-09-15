let fs = require("fs");

let asyncFs = fnName => (...args) => new Promise((ok, bad) => {
	let cb = (err, res) => err? bad(err): ok(res)
	//console.error("Calling " + fnName + " with " + [...args, cb]);
	fs[fnName].apply(fs, [...args, cb])
})

let asyncFsNames = ["readdir", "readFile", "stat", "mkdir", "writeFile"];
asyncFsNames.forEach(name => module.exports[name] = asyncFs(name));

let readdirRecursive = async (root, result, prefix) => {
	result = result || [];
	prefix = prefix || "";
	
	let entryList = await afs.readdir(root);
	await Promise.all(entryList.map(async entry => {
		let fullPath = path.join(root, entry);
		let prefixedEntry = path.join(prefix, entry)
		let stat = await afs.stat(fullPath);
		if(stat.isDirectory()){
			await readdirRecursive(fullPath, result, prefixedEntry);
		} else if(stat.isFile()){
			result.push(prefixedEntry);
		}
	}));
	
	return result;
}

module.exports.readdirRecursive = root => readdirRecursive(root);

module.exports.exists = async path => {
	try {
		await module.exports.stat(path)
		return true;
	} catch(e){
		return false;
	}
	
}