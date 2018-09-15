// тул для сбора кучи AMD-like пакетов в один файл, который можно eval-нуть
let path = require("path");
let getBundleCode = require("./bundler").getBundleCode

let { cliArg, cliArgBool} = require("./cli_arg");

let tsConfigPath = path.resolve(process.cwd(), cliArg("--tsconfig"));
let entryPoint = cliArg("--entry-point");
let entryPointFunctionName = cliArg("--entry-point-function");
let fancy = cliArgBool("--fancy");

(async () => {
	try {
		
		let bundleCode = await getBundleCode({
			fancy: fancy,
			entryPoint: entryPoint,
			entryPointFunction: entryPointFunctionName,
			tsConfigPath: tsConfigPath
		});
		
		console.log(bundleCode);
	} catch(e){
		console.error(e.stack);
		process.exit(1);
	}
})();
