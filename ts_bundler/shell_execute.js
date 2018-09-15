let childProcess = require("child_process");

module.exports.shellExecute = (cmd, otherOptions) => new Promise((ok, bad) => {
	try {
		let stderr = [], stdout = [];
		let proc = childProcess.exec(cmd, Object.assign({encoding: "utf8", windowsHide: true}, otherOptions || {}), 
			(err/*, stdout, stderr*/) => {
				if(err){
					err.stderr = stderr.join("");
					err.stdout = stdout.join("")
					return bad(err);
				}
				ok({stdout: stdout.join(""), stderr: stderr.join("")})
			}
		);
		proc.stderr.on("data", d => stderr.push(d));
		proc.stdout.on("data", d => stdout.push(d));
	} catch(e){ 
		return bad(e) 
	}
})
/*
module.exports.shellExecuteFile = (file, argList, otherOptions) => new Promise((ok, bad) => {
	try {
		let stderr = [], stdout = [];
		let proc = childProcess.execFile(file, argList, Object.assign({encoding: "utf8", windowsHide: true}, otherOptions || {}), 
			err => {
				if(err){
					err.stderr = stderr.join("");
					err.stdout = stdout.join("")
					return bad(err);
				}
				ok({stdout: stdout.join(""), stderr: stderr.join("")})
			}
		);
		proc.stderr.on("data", d => stderr.push(d));
		proc.stdout.on("data", d => stdout.push(d));
	} catch(e){ 
		return bad(e) 
	}
})
*/