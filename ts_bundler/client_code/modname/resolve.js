function(base, name){
	return (name.charAt(0) !== "."? name: this.join(this.dirname(base), name)).replace(/^.\//, "")
}