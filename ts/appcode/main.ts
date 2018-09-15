import {DrawController} from "draw_controller";

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

function rotate(controller: DrawController, speed: number = Math.PI / 10){
	let lastFrame = Date.now();
	
	let rafIndex: number;
	let doDraw = () => {
		let span = Date.now() - lastFrame;
		lastFrame = Date.now();
		
		controller.scene.options.yaw += speed * (span / 1000);
		controller.draw();
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
	
	let controller = new DrawController({ root: document.body });
	controller.generate();
	controller.draw();
	
	rotate(controller);
	
	watchSize(debounced(250, () => controller.draw()));
}