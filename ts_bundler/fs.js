let fs = require("fs");

module.exports = {
	readdir: path => new Promise((ok, bad) => fs.readdir(path, (err, res) => err? bad(err): ok(res))),
	stat: path => new Promise((ok, bad) => fs.stat(path, (err, res) => err? bad(err): ok(res))),
	readFile: path => new Promise((ok, bad) => fs.readFile(path, "utf8", (err, res) => err? bad(err): ok(res)))
}