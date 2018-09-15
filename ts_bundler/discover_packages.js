let fs = require("./fs"),
	path = require("path"),
	fail = require("./fail")
	
let jsExtReg = /\.[jJ][sS]$/;

let extractRoots = (tsConfigPath, tsConfig) => {
	if(tsConfig.compilerOptions.rootDirs)
		fail("This tool cannot be used in conjunction with \"rootDirs\" compiler option.");
		
	let outDir = tsConfig.compilerOptions.outDir;
	if(!outDir)
		fail("This tool expects \"outDir\" compiler option to be present.");
	outDir = path.resolve(path.dirname(tsConfigPath), outDir);
		
	// зачем мы этого требуем? я уже не помню. скорее всего, для простоты восприятия всей этой хрени
	// возможно, когда-нибудь потом это потребуется отпилить
	let baseUrl = tsConfig.compilerOptions.baseUrl;
	if(baseUrl !== "." && baseUrl !== "./")
		fail("This tool expects \"baseUrl\" compiler option to have value \"./\" .");
	
	let paths = tsConfig.compilerOptions.paths;
	if(Object.keys(paths).length !== 1 || !("*" in paths))
		// наверняка когда-нибудь потом мы захотим это изменить. пока что пусть будет так
		// (потому что на данный момент непонятно, зачем мы захотим еще поиспользовать paths)
		fail("This tool expects \"paths\" compiler options to have exactly one key: \"*\".");
	
	paths = paths["*"];
	
	{
		let badPaths = paths
			.filter(x => !x.startsWith("\.") || !x.endsWith("*"))
		if(badPaths.length > 0)
			fail("This tool could not process absolute paths, or paths not ending with \"*\"; those are:\n\t" + badPaths.join("\n\t"));
	}
	
	paths = paths.map(x => path.normalize(x));
	
	if(paths.length < 2){
		paths = ["./"]
	} else {
		/*
			тут мы реверс-инжинирим логику, по которой tsc раскладывает js-файлы в outDir
			логика следующая: 
				находим наименьшую общую директорию
				располагаем js-файлы таким образом, как если бы outDir была бы этой наименьшей директорией, на месте ts-файлов
			TODO: здесь это делается неправильно. в некоторых случаях (["./a/b/c", "./a/b/d"]) эта логика работать не будет
		*/
		let upLevelPaths = paths.map(x => [x, x.split(path.sep).filter(x => x === "..").length]);
		let maxUpLevel = upLevelPaths.map(x => x[1]).reduce((a, b) => Math.max(a, b), 0);
		let pathParts = path.resolve().split(path.sep).filter(x => !!x);
		pathParts = pathParts.slice(pathParts.length - maxUpLevel);
		
		if(maxUpLevel > pathParts.length)
			fail("Unexpected path elevation: expected no more than " + pathParts.length + ", but have " + maxUpLevel + " in path " + upLevelPaths.find(x => x[1] === maxUpLevel)[0]);
			
		paths = upLevelPaths
			.map(x => [x[0], path.join.apply(path, pathParts.slice(0, maxUpLevel - x[1]))])
			.map(x => path.join(x[1], x[0].replace(new RegExp("^(?:\\.\\.\\" + path.sep + ")*"), "")))
			.map(x => x.replace(/\*$/, ""))
	}
	
	return paths.map(x => path.resolve(outDir, x));
}

module.exports = async tsConfigPath => {
	let tsConfigDir = path.dirname(tsConfigPath);
	let tsConf = JSON.parse(await fs.readFile(tsConfigPath));
	let packageRoots = extractRoots(tsConfigPath, tsConf);
	
	let getPackageListsIn = async (entryPath, result) => {
		result = result || [];
		let stat = await fs.stat(entryPath);
		if(stat.isDirectory()){
			let children = await fs.readdir(entryPath);
			let childPromises = children.map(x => getPackageListsIn(path.join(entryPath, x), result))
			await Promise.all(childPromises);
		} else if(stat.isFile()) {
			if(entryPath.toLowerCase().match(jsExtReg))
				result.push(entryPath)
		} else	
			fail("Could not process filesystem entry " + entryPath + " : it's not file nor directory.");
		return result;
	}
	
	let result = {};
	await Promise.all(packageRoots.map(async root => {
		(await getPackageListsIn(root)).forEach(packagePath => {
			let packageName = path.normalize(path.relative(root, packagePath))
				.replace(jsExtReg, "")
				.replace(new RegExp("\\" + path.sep, "g"), "/");
			if(packageName in result)
				fail("Duplicate package definition: in " + packagePath + " and " + result[packageName]);
			result[packageName] = packagePath
		});
	}));
	
	return result;
}