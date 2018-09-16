import {Scene} from "core/scene";
import * as perf from "perf";
import {list as mutatorList} from "generated/mutators";

function debounced(bounceTime: number, action: () => void): () => void {
  if(bounceTime < 0)
    return action;

  let handle: number | null = null;

  let timeoutAction = () => {
    handle = null;
    action()
  }

  return () => {
    if(handle)
      clearTimeout(handle);
    handle = setTimeout(timeoutAction, bounceTime);
  }

}

function watchSize(onChange: () => void): () => void {
	let h = window.innerHeight, w = window.innerWidth;
	let interval = setInterval(() => {
		if(h !== window.innerHeight || w !== window.innerWidth){
			h = window.innerHeight;
			w = window.innerWidth;
			onChange();
		}
	}, 100)
	return () => clearInterval(interval);
}

function createCanvas(root: HTMLElement){
	root.innerHTML = "";
	
	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	if(!context){
		root.textContent = "UNSUPPORTED BROWSER";
		throw new Error("Unsupported browser: no context could be retrieved.")
	}
	root.appendChild(canvas);
	
	canvas.setAttribute("width", root.clientWidth + "px");
	canvas.setAttribute("height", root.clientHeight + "px");
	canvas.style.position = "absolute";
	canvas.style.top = canvas.style.bottom = canvas.style.left = canvas.style.right = "0px";
	
	return context as CanvasRenderingContext2D;
}

const perfResetInterval = 3000;
let lastPerfResetTime = 0;
let drawCounter = 0;
function tickPerf(){
	let perfSpan = Date.now() - lastPerfResetTime;
	if(!lastPerfResetTime){
		perf.reset();
		lastPerfResetTime = Date.now();
		drawCounter = 0;
	} else if(perfSpan > perfResetInterval){
		console.log("FPS: " + Math.floor(drawCounter / (perfSpan / 1000)) + " (" + drawCounter + " frames over " + (perfSpan / 1000) + " seconds)");
		perf.dump();
		perf.reset();
		drawCounter = 0;
		lastPerfResetTime = Date.now();
	}
	drawCounter++;
}

function createScene(root: HTMLElement){
	return new Scene({
		yaw: Math.PI / 2,
		pitch: Math.PI / 8,
		scale: 20,
		width: 64,
		depth: 64,
		height: 8,
		context: createCanvas(root),
		centerX: root.clientWidth / 2,
		centerY: root.clientHeight / 2
	});
}

function draw(scene: Scene, root: HTMLElement){
	tickPerf();
	scene.options.context.clearRect(0, 0, root.clientWidth, root.clientHeight);
	let painter = scene.createPainter();
	perf.start("scene_draw")
	scene.draw(painter);
	painter.close();
	perf.end()
}

function rotate(speed: number, scene: Scene, root: HTMLElement): () => void {
	let lastFrame = Date.now();
	
		let rafIndex: number;
		let doDraw = () => {
			let span = Date.now() - lastFrame;
			lastFrame = Date.now();
			
			scene.options.yaw += speed * (span / 1000);
			scene.invalidate();
			draw(scene, root);
			rafIndex = requestAnimationFrame(doDraw);
		}
		
		doDraw();
		return () => cancelAnimationFrame(rafIndex);
}

export function run(){
	document.body.style.position = "relative";
	document.body.style.height = "100vh";
	document.body.style.width = "100vw";
	document.body.style.padding = document.body.style.margin = "0px";
	
	let root = document.body
	let scene = createScene(root);

	mutatorList
		.filter(x => !x.disabled)
		.sort((a, b) => a.priority - b.priority)
		.forEach(mutator => scene.mutate(mutator));

	rotate(Math.PI / 10, scene, root);

	watchSize(debounced(250, () => draw(scene, root)));
}