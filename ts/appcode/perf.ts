let orderCounter = 0;

interface Measure {
	sectionStart: number | null;
	totalTime: number;
	order: number;
	nested: {[k: string]: Measure};
}

let now: () => number = performance && performance.now? () => performance.now(): () => Date.now()
let root: Measure = {
	sectionStart: null,
	totalTime: 0,
	nested: {},
	order: orderCounter++
};

let measureStack = [root] as Measure[];

export function reset(){
	measureStack = [root = {
		sectionStart: null,
		totalTime: 0,
		nested: {},
		order: orderCounter++
	}];
}

export function start(sectionName: string){
	let wrappingMeasure = measureStack[measureStack.length - 1];
	if(!(sectionName in wrappingMeasure.nested)){
		wrappingMeasure.nested[sectionName] = { sectionStart: now(), totalTime: 0, nested: {}, order: orderCounter++ }
	} else {
		if(wrappingMeasure.nested[sectionName].sectionStart !== null) {
			throw new Error("Measure \"" + sectionName + "\" is already started.");
		} else {
			wrappingMeasure.nested[sectionName].sectionStart = now();
		}
	}
	measureStack.push(wrappingMeasure.nested[sectionName]);
}

export function end(){
	let topMeasure = measureStack[measureStack.length - 1];
	let prevTopMeasure = measureStack[measureStack.length - 2];
	if(!prevTopMeasure || !topMeasure)
		throw new Error("Could not start measuring without reset.");
	else {
		topMeasure.totalTime += now() - (topMeasure.sectionStart as number);
		topMeasure.sectionStart = null;
		measureStack.pop();
	}
}

export function endStart(startSectionName: string){
	end();
	start(startSectionName);
}

const offsetter = "  ";
const separator = " | ";

function maxNameLength(startingWith: Measure = root): number{
	return offsetter.length + Object.keys(startingWith.nested)
		.map(name => Math.max(name.length, maxNameLength(startingWith.nested[name])))
		.reduce((a, b) => Math.max(a, b), 0)
		
}

function pad(str: string, toLen: number): string{
	while(str.length < toLen)
		str += " ";
	return str;
}

const maxNumLen = 8;
function formatNum(num: number): string {
	let res: string;
	if(!(num % 1)){
		res = num + "";
		if(res.length > maxNumLen && res.length - 2 <= maxNumLen)
			res = res.replace(/\d{3}$/, "k")
		else if(res.length > maxNumLen && res.length - 4 <= maxNumLen)
			res = res.replace(/\d{6}$/, "kk")
		else if(res.length > maxNumLen && res.length - 6 <= maxNumLen)
			res = res.replace(/\d{9}$/, "kkk")
	}
	else if(num < 0.00001)
		res = "~0";
	else
		res = num.toFixed(maxNumLen - 3);
	return pad(res, maxNumLen);
}

function toString(startWith: Measure = root, offset: string = "", nameSize: number = maxNameLength()): string{
	return Object.keys(startWith.nested)
		.sort((a, b) => startWith.nested[a].order - startWith.nested[b].order)
		.map(name => {
			let child = startWith.nested[name];
			let firstLine = [
				pad(offset + name, nameSize),
				startWith.totalTime? formatNum((child.totalTime / startWith.totalTime) * 100) + "%": pad("<unknown>", maxNumLen + 1),
				formatNum(child.totalTime / 1000) + "s"
			].join(separator)
			let otherLines = toString(child, offset + offsetter, nameSize);
			return firstLine + (otherLines? "\n": "") + otherLines;
		}).join("\n");
}

export function dump(){
	console.log(toString());
}