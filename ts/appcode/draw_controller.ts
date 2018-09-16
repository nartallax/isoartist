import {Scene} from "core/scene"
import {list as mutatorList} from "generated/mutators";
import * as perf from "perf";

export interface DrawControllerOptions {
	root: HTMLElement;
}

const perfResetInterval = 3000;
let lastPerfResetTime = 0;

export class DrawController {
	private root: HTMLElement;
	private _scene: Scene | null = null;
	private drawCounter: number = 0;
	
	get scene():Scene{
		if(this._scene === null){
			this.generate();
		}
		return this._scene as Scene;
	}
	
	constructor(opts: DrawControllerOptions){
		this.root = opts.root;
	}
	
	private get screenSize(){ return { width: this.root.clientWidth, height: this.root.clientHeight } }
	
	private createCanvas(): CanvasRenderingContext2D {
		this.root.innerHTML = "";
		
		let canvas = document.createElement("canvas");
		let context = canvas.getContext("2d");
		if(!context){
			this.root.textContent = "UNSUPPORTED BROWSER";
		}
		this.root.appendChild(canvas);
		
		let {width, height} = this.screenSize;
		
		canvas.setAttribute("width", width + "px");
		canvas.setAttribute("height", height + "px");
		canvas.style.position = "absolute";
		canvas.style.top = canvas.style.bottom = canvas.style.left = canvas.style.right = "0px";
		
		return context as CanvasRenderingContext2D;
	}
	
	generate(){
		let {width, height} = this.screenSize;
		
		let scene = this._scene = new Scene({
			yaw: Math.PI / 2,
			pitch: Math.PI / 8,
			scale: 20,
			width: 64,
			depth: 64,
			height: 8,
			context: this.createCanvas(),
			centerX: width / 2,
			centerY: height / 2
		});
		
		mutatorList
			.filter(x => !x.disabled)
			.sort((a, b) => a.priority - b.priority)
			.forEach(mutator => scene.mutate(mutator));
	}
	
	draw(){
		let perfSpan = Date.now() - lastPerfResetTime;
		if(!lastPerfResetTime){
			perf.reset();
			lastPerfResetTime = Date.now();
			this.drawCounter = 0;
		} else if(perfSpan > perfResetInterval){
			console.log("FPS: " + Math.floor(this.drawCounter / (perfSpan / 1000)) + " (" + this.drawCounter + " frames over " + (perfSpan / 1000) + " seconds)");
			perf.dump();
			perf.reset();
			this.drawCounter = 0;
			lastPerfResetTime = Date.now();
		}
		this.drawCounter++;
		
		let scene = this.scene;
		let {width, height} = this.screenSize;
		
		scene.options.context.clearRect(0, 0, width, height);
		let painter = scene.createPainter();
		perf.start("scene_draw")
		scene.draw(painter);
		painter.close();
		perf.end()
	}

	rotate(speed: number): () => void{
		let lastFrame = Date.now();
	
		let rafIndex: number;
		let doDraw = () => {
			let span = Date.now() - lastFrame;
			lastFrame = Date.now();
			
			this.scene.options.yaw += speed * (span / 1000);
			this.scene.invalidate();
			this.draw();
			rafIndex = requestAnimationFrame(doDraw);
		}
		
		doDraw();
		return () => cancelAnimationFrame(rafIndex);
	}

	run(){
		this.rotate(Math.PI / 10);
	}
}