let afs = require("./afs"),
	path = require("path"),
	SequenceGen = require("./sequence_gen");


	
module.exports = class MutatorSearcher {
	
	constructor(tsRoot, mutatorAppendix){
		this.tsRoot = tsRoot;
		this.mutatorAppendix = mutatorAppendix;
		this.mutatorRoot = path.resolve(this.tsRoot, this.mutatorAppendix);
	}
	
	async listMutatorFiles(){
		let dirs = await afs.readdir(this.mutatorRoot);
		return (await Promise.all(dirs.map(async dir => {
			let fullDir = path.resolve(this.mutatorRoot, dir);
			let stat = await afs.stat(fullDir);
			if(!stat.isDirectory()){
				console.error("Unexpected non-directory in mutator root: " + fullDir);
				return null;
			}
			let mutatorFilePath = path.resolve(fullDir, "./mutator.ts");
			try {
				let stat = await afs.stat(mutatorFilePath);
				if(!stat.isFile()){
					console.error("Expected mutator definition file to be file at: " + mutatorFilePath);
					return null;
				}
			} catch(e){
				console.error("Could not stat " + mutatorFilePath);
				return null;
			}
			return path.join(fullDir, "./mutator.ts");
		}))).filter(x => !!x)
	}
	
	async listMutatorModules(){
		let files = await this.listMutatorFiles();
		return files
			.map(x => path.relative(this.tsRoot, x))
			.map(x => x.replace(/\.[tT][sS]$/, "").replace(/[\\\/]/g, "/"));
	}
	
	async generateMutatorListCode(){
		let seqGen = new SequenceGen("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
		
		let modules = await this.listMutatorModules();
		let namedModules = modules.map(x => [x, seqGen.next()]);
		
		let imp = namedModules.map(x => "import { Mutator as " + x[1] + " } from \"" + x[0] + "\"").join("\n"),
			exp = namedModules.map(x => "new " + x[1] + "()").join(",\n");
			
		return [
			"import {Mutator as IMutator} from \"interfaces\"",
			imp,
			"export const list = [",
			exp,
			"] as IMutator[]"
		].join("\n");
	}
	
}