let afs = require("./afs"),
	path = require("path"),
	getBundleCode = require("../ts_bundler/bundler").getBundleCode
	
module.exports = class ClientBuilder {
	
	constructor(params){
		this.tsconfigPath = params.tsconfigPath;
		this.entryPoint = params.entryPoint;
		this.entryPointFunction = params.entryPointFunction;
		this.fancyCode = params.fancyCode;
		this.iconPath = params.iconPath;
		this.title = params.title;
		this.scripts = params.additionalScripts || [];
	}
	
	async build(){
		return `<!DOCTYPE html>
<html>
	<head>
		<!-- by Nartallax -->
		${this.titleTag()}
		${await this.iconTag()}
		${(await this.scriptTags()).join("\n\t\t")}
	</head>
	<body></body>
</html>`
	}
	
	async iconTag(){
		if(!this.iconPath)
			return "";
		let ext = ((this.iconPath.match(/[^.]+$/) || [])[0] || "ico").toLowerCase();
		let mime = ({
			"ico": "x-icon",
			"jpg": "jpeg"
		})[ext] || ext;
		
		let b64 = await afs.readFile(this.iconPath, "base64");
		
		return `<link rel="shortcut icon" type="image/${mime}" href="data:image/${mime};base64,${b64}">`
	}
	
	titleTag(){
		return `<title>${this.title}</title>`
	}
	
	async scriptTags(){
		return [...this.scripts, await this.getJs()]
		.map(x => x.replace(/<\/script/g, "</scri\\pt"))
		.map(x => `<script type="text/javascript">${x}</script>`)
	}
	
	async getJs(){
		return await getBundleCode({
			fancy: this.fancyCode,
			entryPoint: this.entryPoint,
			entryPointFunction: this.entryPointFunction,
			tsConfigPath: this.tsconfigPath 
		})
	}
}