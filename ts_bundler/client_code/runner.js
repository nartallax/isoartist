(function(packageCode, modname, runEval, entryPointPkg, entryPointFn){
	var knownPackages = {
		require: function(name){
			throw new Error("Direct usage of require() is explicitly forbidden.");
		}
	}

	var currentPackage = null;
	var define = function(reqs, fn){
		var pkgs = [];
		var result = null;
		for(var i = 0; i < reqs.length; i++){
			var r = modname.resolve(currentPackage, reqs[i]);
			if(r === "exports")
				pkgs.push(result = {});
			else if(!(r in knownPackages))
				throw new Error("Package is not defined by the time it is requested: \"" + r + "\".");
			else
				pkgs.push(knownPackages[r]);
		}
		fn.apply(null, pkgs);
		knownPackages[currentPackage] = result;
	}
	
	var run = function(){
		for(var i = 0; i < packageCode.length; i++){
			var pkgName = packageCode[i][0];
			var pkgCode = packageCode[i][1] + "\n//# sourceURL=" + pkgName;
			currentPackage = pkgName;
			runEval(pkgCode, define);
			currentPackage = null;
		}
		knownPackages[entryPointPkg][entryPointFn]();
	}
	
	var waitLoad = function(cb){
		var interval = null;
		var loaded = false;
		
		var wcb = function(){
			if(loaded)
				return;
			loaded = true;
			if(interval)
				clearInterval(interval);
			cb();
		}
		
		var checkState = function(){
			if(document && (document.readyState === "interactive" || document.readyState === "complete"))
				wcb();
		}
		
		window.addEventListener("load", wcb);
		document.addEventListener("load", wcb);
		document.addEventListener("readystatechange", checkState);
		interval = setInterval(checkState, 10);
		checkState();
	}
	
	waitLoad(run);
})