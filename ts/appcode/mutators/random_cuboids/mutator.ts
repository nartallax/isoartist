import {Mutator as IMutator, Scene} from "interfaces"
import {EmptyFloor} from "components/empty_floor"
import {EmptyWall} from "components/empty_wall"

export class Mutator implements IMutator {
	name = "random_cuboids";
	priority = 1;
	
	density = 0.1;
	minSize = 1;
	maxSize = 4;
	
	mutate(scene: Scene){
		let remSpace = scene.bounds.volume * this.density;
		let tw = scene.bounds.width, th = scene.bounds.height, td = scene.bounds.depth,
			tl = scene.bounds.left, tb = scene.bounds.bottom, tn = scene.bounds.near;
		while(remSpace > 0){
			let w = Math.floor(Math.random() * (this.maxSize - this.minSize)) + this.minSize,
				h = Math.floor(Math.random() * (this.maxSize - this.minSize)) + this.minSize,
				d = Math.floor(Math.random() * (this.maxSize - this.minSize)) + this.minSize;
				
			let sx = Math.floor(Math.random() * (tw - w)) + tl,
				sy = Math.floor(Math.random() * (td - d)) + tn,
				sz = Math.floor(Math.random() * (th - h)) + tb;
				
			let volume = w * h * d;
			remSpace -= volume;
			
			for(let x = sx; x < sx + w; x++){
				for(let y = sy; y < sy + d; y++){
					scene.objects.add(new EmptyFloor(x, y, sz));
					scene.objects.add(new EmptyFloor(x, y, sz + h));
				}
			}
			
			for(let x = sx; x < sx + w; x++){
				for(let z = sz; z < sz + h; z++){
					scene.objects.add(new EmptyWall(x, sy, z, false));
					scene.objects.add(new EmptyWall(x, sy + d, z, false));
				}
			}
			
			for(let y = sy; y < sy + d; y++){
				for(let z = sz; z < sz + h; z++){
					scene.objects.add(new EmptyWall(sx, y, z, true));
					scene.objects.add(new EmptyWall(sx + w, y, z, true));
				}
			}
		}
	}
}