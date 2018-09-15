function(){
	var result = [];
	for(var i = 0; i < arguments.length; i++){
		var x = arguments[i];
		(i === 0) || (x = x.replace(/^\//, ""));
		(i === arguments.length - 1) || (x = x.replace(/\/$/, ""));
		x && result.push(x);
	}
	return this.normalize(result.join("/"));
}