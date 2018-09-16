import {Mutator as IMutator, Scene} from "interfaces"
import {EmptyFloor} from "components/empty_floor"

export class Mutator implements IMutator {
	name = "zero_floor_plain";
	priority = 0;

	disabled = true
	
	mutate(scene: Scene){
		for(let x = scene.bounds.left; x < scene.bounds.right; x++){
			for(let y = scene.bounds.near; y < scene.bounds.far; y++){
				scene.objects.add(new EmptyFloor(x, y, scene.bounds.bottom));
			}
		}
	}
}