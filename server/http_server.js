let http = require("http"),
	url = require("url");

module.exports = opts => new Promise((ok, bad) => {
	const requestHandler = async (request, response) => {
		try {
			let handler = opts.handlers[request.url];
			if(!handler){
				response.statusCode = 404;
				response.statusMessage = "Not Found";
				response.end();
				return;
			}
			
			let rawHandlerResult = typeof(handler) === "function"? handler(request, response): handler
			let result = await Promise.resolve(rawHandlerResult);
			
			if(result){
				response.statusCode = 200;
				response.statusMessage = "OK";
				response.end(result);
			} else {
				response.end();
			}
		} catch(e){
			console.error(e.stack)
			response.statusCode = 500;
			response.statusMessage = "Server Error";
			response.end("Something bad happened on server. Sorry.");
		}
	}

	let server = http.createServer(requestHandler)
	server.listen(opts.port, (err) => err? bad(err): ok(server));
})