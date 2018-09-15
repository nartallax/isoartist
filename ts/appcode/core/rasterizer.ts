import {ScenePoint} from "interfaces";

export interface RasterizerOptions {
	/** Размер единицы изоморфного пространства в пикселях */
	scale: number;
	/** Величина в радианах угла поворота на горизонтальной плоскости. 0 = вид в торец  */
	yaw: number;
	/** Величина в радианах угла поворота на вертикальной плоскости. 0 = вид сбоку; Pi/2 = вид сверху */
	pitch: number;
	/** X точки 0;0;0 на экране, в пикселях */
	centerX: number;
	/** Y точки 0;0;0 на экране, в пикселях */
	centerY: number;
}

/** Класс, умеющий конвертировать изоморфное пространство в плоское */
export class Rasterizer {
	readonly opts: RasterizerOptions;
	constructor(opts: RasterizerOptions){
		this.opts = opts;
		this.updateCache();
	}
	
	private ys: number = 0;
	private yc: number = 0;
	private ps: number = 0;
	private pc: number = 0;
	
	updateCache(){
		this.ys = Math.sin(this.opts.yaw);
		this.yc = Math.cos(this.opts.yaw);
		this.ps = Math.sin(this.opts.pitch);
		this.pc = Math.cos(this.opts.pitch)
	}
	
	toSizeRecording(): SizeRecordingRasterizer {
		if(this instanceof SizeRecordingRasterizer)
			return this as SizeRecordingRasterizer;
		else
			return new SizeRecordingRasterizer({...this.opts});
	}
	
	/*
	pointX(point: ScenePoint): number {
		perf.start("rasterizer_point_x")
		let res = (((point.x * this.yc) - (point.y * this.ys)) * this.opts.scale) + this.opts.centerX;
		perf.end()
		return res;
	}
	pointY(point: ScenePoint): number {
		perf.start("rasterizer_point_y")
		let res = (((((point.x * this.ys) + (point.y * this.yc)) * this.ps) - (point.z * this.pc)) * this.opts.scale) + this.opts.centerY
		perf.end()
		return res;
	}
	*/
	point(point: ScenePoint): {x: number, y: number}{
		let x = (point.x * this.yc) - (point.y * this.ys);
		let y = (((point.x * this.ys) + (point.y * this.yc)) * this.ps)	- (point.z * this.pc)
		
		let result = {
			x: (this.opts.scale * x) + this.opts.centerX,
			y: (this.opts.scale * y) + this.opts.centerY
		}
		return result;
	}
	
}

export class SizeRecordingRasterizer extends Rasterizer {
	left: number = Number.MAX_SAFE_INTEGER;
	right: number = -Number.MAX_SAFE_INTEGER;
	bottom: number = Number.MAX_SAFE_INTEGER;
	top: number = -Number.MAX_SAFE_INTEGER;
	
	get haveSizeData(): boolean {
		return this.left <= this.right;
	}
	
	point(point: ScenePoint): {x: number, y: number}{
		let res = super.point(point);
		this.left = Math.min(this.left, res.x);
		this.right = Math.max(this.right, res.x)
		this.top = Math.max(this.top, res.y);
		this.bottom = Math.max(this.bottom, res.y);
		return res;
	}
	
}