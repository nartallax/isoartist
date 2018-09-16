import {Painter as IPainter, ScenePoint} from "interfaces";
import {Rasterizer} from "./rasterizer";

export class FakePainter implements IPainter {
	private readonly rasterizer: Rasterizer;
	constructor(rasterizer: Rasterizer){
		this.rasterizer = rasterizer;
	}
	
	polyline(points: ScenePoint[]){
		for(let i = 0; i < points.length; i++)
			this.rasterizer.point(points[i]);
	}
	
	polyfill(points: ScenePoint[]){
		for(let i = 0; i < points.length; i++)
			this.rasterizer.point(points[i]);
	}
	
	close(){}
}

export class Painter implements IPainter {
	private readonly rasterizer: Rasterizer;
	private readonly context: CanvasRenderingContext2D;
	
	constructor(rasterizer: Rasterizer, context: CanvasRenderingContext2D){
		this.rasterizer = rasterizer;
		this.context = context;
	}
	
	polyline(points: ScenePoint[], color: string){
		if(points.length < 1)
			return;
		
		let c = this.context;
		c.strokeStyle = color;
		c.beginPath();
		
		let p = this.rasterizer.point(points[0])
		c.moveTo(p.x, p.y);
		
		for(let i = 1; i < points.length; i++){
			let p = this.rasterizer.point(points[i]);
			c.lineTo(p.x, p.y);
		}
		
		c.stroke();
	}
	
	polyfill(points: ScenePoint[], fillColor: string, strokeColor?: string){
		if(points.length < 3)
			return;
		
		let c = this.context;
		c.beginPath();
		
		let p = this.rasterizer.point(points[0])
		c.moveTo(p.x, p.y);
		
		for(let i = 1; i < points.length; i++){
			let p = this.rasterizer.point(points[i]);
			c.lineTo(p.x, p.y);
		}
		
		c.fillStyle = fillColor;
		c.fill();
		
		if(strokeColor){
			c.strokeStyle = strokeColor;
			c.stroke();
		}
		
	}
	
	image(img: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number){
		this.context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
	}
	
	close(){
		
	}
}