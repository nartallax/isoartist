module.exports = code => {
	let commons = {};
	
	while(!code.match(/^define\(\["/)){
		let newCode = code.replace(/^.([\n\r]|.)*?(?=var\s+__\S+\s*=[^=]|define\(\[\")/, "");
		let commonCode = code.substring(0, code.length - newCode.length);
		let commonCodeName = commonCode.match(/var __(\S+)\s*=[^=]/)[1];
		commons[commonCodeName] = commonCode;
		code = newCode;
	}

	return [commons, code];
}