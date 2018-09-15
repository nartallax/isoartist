let fs = require("./fs"),
	fail = require("./fail"),
	modname = require("./modname");

class NoCircularStack {
	constructor(){
		this.set = new Set();
		this.arr = [];
	}
	
	run(name, action){
		if(this.set.has(name))
			fail("Recursive dependency detected: " + this.arr.join(" -> ") + " -> " + name + "; those are not allowed.");
		this.arr.push(name);
		this.set.add(name);
		try {
			return action();
		} finally {
			this.arr.pop();
			this.set.delete(name);
		}
	}
}

class Reorderer {
	constructor(depMap){
		this.depMap = depMap;
		this.depIndexMap = {};
		this.stack = new NoCircularStack();
	}
	
	calculateIndex(name){
		if(!(name in this.depIndexMap))
			this.depIndexMap[name] = this.stack.run(name, () => {
				let deps = this.depMap[name] || [];
				return deps.map(x => this.calculateIndex(x)).reduce((a, b) => a + b, 0) + 1;
			});
		return this.depIndexMap[name];
	}
	
	reorder(deps){
		deps = deps.map(x => [x, this.calculateIndex(x)])
		deps = deps.sort((a, b) => a[1] - b[1])
		return deps.map(x => x[0]);
	}
}

class DependencyTraverser {
	
	constructor(paths){
		this.paths = paths;
		this.thrownAwayPackages = new Set(["require", "exports"]);
	}
	
	async getImmediateDependencies(name){
		this.knownDependencies = this.knownDependencies || {};
		this.immediateWaiters = {};
		name = modname.normalize(name);
		
		if(name in this.immediateWaiters)
			await this.immediateWaiters[name];
		if(name in this.knownDependencies)
			return this.knownDependencies[name];
		
		let ok, bad;
		this.immediateWaiters[name] = (new Promise((_ok, _bad) => { ok = _ok, bad = _bad }))
		
		if(!(name in this.paths))
			fail("Unknown module name: " + name); // not really gonna happen; tsc will check for these
		
		let deps = await this.forceGetImmediateDependencies(name);
		
		this.knownDependencies[name] = deps;
		delete this.immediateWaiters[name];
		ok();
		
		return deps;
	}
	
	async forceGetImmediateDependencies(name){
		let filePath = this.paths[name];
		
		let content = await fs.readFile(filePath);
		let deps = [];
		let define = depList => deps.push(depList);
		eval(content);
		if(deps.length !== 1)
			fail("Definition of " + name + " is incorrect: expected exactly one define() call, got " + deps.length + " instead.");
		deps = deps[0];
		
		// тут (как и кое-где еще) велик соблазн работать с именами модулей как с путями, через path.join() и т.п.
		// делать этого не следует, т.к. path платформозависим; имена модулей же всегда пишутся через "/"
		// к тому же, правила обращения с модулями несколько другие, чем с путями
		// (например, у путей a/b/c из директории d означает d/a/b/c; у модулей - несколько более сложную штуку)
		deps = deps
			.map(x => modname.resolve(name, x))
			.filter(x => !this.thrownAwayPackages.has(x));
		return deps;
	}
	
	async getTransitiveDependenciesUnordered(name, result, resolved){
		result = result || new Set();
		resolved = resolved || new Set();
		resolved.add(name);
		
		let deps = await this.getImmediateDependencies(name);
		await Promise.all(deps.map(async dep => {
			result.add(dep);
			if(!resolved.has(dep))
				await this.getTransitiveDependenciesUnordered(dep, result, resolved);
		}));
		
		return result;
	}
	
	async getTransitiveDependencies(name){
		let deps = [...await this.getTransitiveDependenciesUnordered(name)];
		let ordered = new Reorderer(this.knownDependencies || {}).reorder(deps)
		return ordered;
	}
	
	async getFullDependencyList(name){
		let deps = await this.getTransitiveDependencies(name);
		deps.push(modname.normalize(name));
		return deps;
	}
	
}

module.exports = DependencyTraverser;