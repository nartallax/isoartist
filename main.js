let fs = require("fs"),
	path = require("path"),
	ClientBuilder = require("./server/client_builder"),
	startHttpServer = require("./server/http_server"),
	MutatorSearcher = require("./server/mutator_searcher"),
	afs = require("./server/afs");
let { cliArgOrDefault, cliArgBool } = require("./ts_bundler/cli_arg")
let getBundleCode = require("./ts_bundler/bundler").getBundleCode;

let isHelp = cliArgBool("-h", "--h", "-help", "--help");
if(isHelp){
	console.error(
`Isometric Art Generator by Nartallax.

Available CLI options:
  -h, --help: display this text and exit
  -p, --port: define port for HTTP frontend to bind on. 
              Default: 8888
  --devmode:  Enables some strange and unobvious features usable at development time.
`);
	process.exit(0);
}

let isDevmode = cliArgBool("--devmode");
let port = parseInt(cliArgOrDefault("8888", "-p", "--port"))
if(Number.isNaN(port)){
	console.error("Bad port value: " + cliArgOrDefault("8888", "-p", "--port"));
	process.exit(1);
}

let generatedCodeDir = "./ts/appcode/generated";
let generateCode = async () => {
	console.error("Generating code...");
	if(!(await afs.exists(generatedCodeDir)))
		await afs.mkdir(generatedCodeDir);
	let code = await new MutatorSearcher("./ts/appcode", "./mutators").generateMutatorListCode();
	await afs.writeFile(path.resolve(generatedCodeDir, "./mutators.ts"), code, "utf8");
}
	
let assembleFrontpage = async () => {
	console.error("Assembling the frontpage...")
	let builder = new ClientBuilder({
		fancyCode: isDevmode,
		tsconfigPath: path.resolve(__dirname, "./ts/tsconfig.json"),
		entryPoint: "main",
		entryPointFunction: "run",
		title: "Isoartist",
		iconPath: path.resolve(__dirname, "./misc/icon.png")
	});
	return await builder.build();
}
	
(async () => {
	try {
		console.error("Starting.")
		
		let frontpage;
		if(!isDevmode){
			await generateCode();
			frontpage = await assembleFrontpage();
		}
		
		console.error("Starting HTTP server...");
		let server = await startHttpServer({
			port: port,
			handlers: {
				"/": async () => {
					if(!isDevmode)
						return frontpage;
					await generateCode();
					return await assembleFrontpage();
				}
			}
		});
		
		console.error("Listening at http://localhost:" + port);
		
	} catch(e){
		console.error(e.stack);
		process.exit(1);
	}
})();
	
