let { shellExecute } = require("./shell_execute"),
	fail = require("./fail"),
	path = require("path"),
	fs = require("./fs")

let npmRoot = null;
let findNpmRoot = async () => {
	if(!npmRoot){
		npmRoot = (await shellExecute("npm config get prefix")).stdout.replace(/(^[\n\r\s\t]+|[\n\r\s\t]+$)/g, "");
	}
	return npmRoot;
}

let resolvedExecutables = new Map();

let findTscExecutable = async tsconfigPath => {
	tsconfigPath = path.normalize(tsconfigPath);
	if(!resolvedExecutables.has(tsconfigPath)){
		let tscExecPaths = [];
		
		let cwd = process.cwd();
		while(true){
			//let newPath = path.resolve(cwd, "./node_modules/typescript/bin/tsc");
			let newPath = path.resolve(cwd, "./node_modules/.bin/tsc");
			tscExecPaths.push(newPath);
			let newCwd = path.resolve(cwd, "..");
			if(newCwd === cwd)
				break;
			cwd = newCwd;
		}
		
		let npmRoot = await findNpmRoot();
		tscExecPaths.push(path.resolve(npmRoot, "./tsc"));
		tscExecPaths.push(path.resolve(npmRoot, "./bin/tsc"));
		
		let validPaths = await Promise.all(tscExecPaths.filter(async epath => {
			try {
				let stat = await fs.stat(epath);
				return stat.isFile();
			} catch(e){
				return false;
			}
		}))
		
		var tscExecutable = validPaths[0];
		
		tscExecutable || fail("TSC is not installed. Expected tsc executable to be at one of paths: \n\t" + tscExecPaths.join("\n\t"));
		
		//console.error("Using tsc in " + tscExecutable + " for " + tsconfigPath);
		
		resolvedExecutables.set(tsconfigPath, tscExecutable);
	}
	
	return resolvedExecutables.get(tsconfigPath);
}

module.exports = {
	run: async (tsconfigPath, opts) => {
		let optStr = [];
		Object.keys(opts).forEach(name => {
			optStr.push((name.length === 1? "-": "--") + name);
			optStr.push(opts[name]);
		});
		optStr = optStr.join(" ");
		
		let tscPath = await findTscExecutable(tsconfigPath);
		tscPath = path.relative(process.cwd(), tscPath);
		try {
			//let execRes = await shellExecuteFile(path.relative(process.cwd(), tscPath), optStr);
			let execRes = await shellExecute(tscPath + " " + optStr);
		} catch(e){
			if(e.stdout || e.stderr)
				fail(e.stdout || e.stderr);
			else
				throw e;
		}
	}
}