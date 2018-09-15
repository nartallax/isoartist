function(name){
	var x = name;
	while(true){
		var xx = x.replace(/[^\/]+\/\.\.\//g, "");
		if(xx.length === x.length)
			break;
		x = xx;
	}
	while(true){
		var xx = x.replace(/\.\//g, "");
		if(xx.length === x.length)
			break;
		x = xx;
	}
	return x;
}