// это немного особый модуль
// он нужен как на этапе сборки бандла, так и на этапе его, бандла, запуска
// поэтому код "продуктовых" функций этого модуля лежит отдельно, в отдельных файлах каждая функция
// и этот модуль умеет как напрямую исполнять эти функции, так и отдавать их json-подобным кодом
// (за исключением того, что в json нет функций - в выдаче этого модуля они будут)
// возможно, когда-нибудь нужны будут еще такие модули - тогда нужно будет вытащить код отсюда

let fs = require("fs"), 
	path = require("path");
let codeDir = path.resolve(__dirname, "./client_code/modname")
let getFnCode = name => fs.readFileSync(path.join(codeDir, name + ".js"), "utf8");

let fnNames = fs.readdirSync(codeDir)
	.filter(x => x.endsWith(".js"))
	.map(x => x.replace(/\.js$/, ""));

let fnCodeMap = {};
fnNames.forEach(fnName => {
	let code = getFnCode(fnName);
	fnCodeMap[fnName] = code;
	let result = null;
	module.exports[fnName] = eval("result = " + code);
});

module.exports.getCodeObject = () => {
	let result = ["{"];
	fnNames.forEach((fnName, i) => {
		(i === 0) || result.push(",")
		result.push("\n");
		result.push(JSON.stringify(fnName));
		result.push(":");
		result.push(fnCodeMap[fnName]);
	});
	result.push("\n}");
	return result.join("")
}