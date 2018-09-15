// здесь в виде интерфейсов изложена общая концепция работы этой системы

/** координаты точки на сцене */
export interface ScenePoint {
	/** x - ось из левого нижнего угла в правый верхний; также влево-вправо; слева - минус, справа - плюс*/
	x: number;
	/** у - ось из правого нижнего угла в левый верхний; также вперед-назад, ближний-дальний; спереди минус, сзади плюс*/
	y: number;
	/** z - ось снизу вверх; внизу минус, сверху плюс */
	z: number;
}

/** параллелепипед на сцене */
export interface SceneCuboid {
	lower: ScenePoint;
	upper: ScenePoint;
	top: number;
	bottom: number;
	left: number;
	right: number;
	near: number;
	far: number;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
	readonly volume: number;
}

//TODO: возможно, будет отличной оптимизацией рисовать каждый тип дравабла только один раз, переиспользуя нарисованное
/** Что угодно, что можно нарисовать */
export interface Drawable {
	/** Идентификатор, определяющий, как внешний вид этого объекта будет кешироваться */
	readonly drawCacheKey?: string;
	
	/** Нарисовать этот объект */
	draw(painter: Painter): void;
	/** Перевычислить ключ кеша */
	invalidate(): void;
}

/** Нечто, подобное Set<T> по интерфейсу, но с произвольными гарантиями уникальности */
export interface SetLike<T> extends Iterable<T> {
	add(x: T): SetLike<T>;
	delete(x: T): boolean;
}

/** Объект на сцене. Что угодно, имеющее графическое представление */
export interface SceneObject extends ScenePoint, Drawable {
	/** Маркеры - список произвольных строк, описывающих этот объект
		Используется для передачи информации между мутаторами */
	readonly markers?: Marker[];
}

/** Сцена. Содержит в себе все рисуемые объекты */
export interface Scene extends Drawable {
	readonly objects: SetLike<SceneObject>;
	readonly bounds: SceneCuboid;
	
	createPainter(): Painter;
	mutate(mutator: Mutator): void;
}

/** Мутатор. Служит для внесения изменений в сцену. */
export interface Mutator {
	readonly name: string;
	/** Чем выше число приоритета - тем позднее будет запущен этот мутатор */
	readonly priority: number;
	/** Если мутатор отключен - он не будет использован в построении сцены */
	readonly disabled?: boolean;
	
	mutate(scene: Scene): void;
}

/** Маркер. В произвольном виде описывает какую-либо часть тайла.
	Сам по себе этот интерфейс вряд ли будет содержать всю необходимую информацию. Следует наследоваться от него. */
export interface Marker {
	readonly name: string;
}

/** Рисовальщик.
	Является высокоуровневой оберткой над каким-либо определенным способом рисования (canvas, svg, ...)*/
export interface Painter {
	polyline(points: ScenePoint[], color: string): void;
	polyfill(points: ScenePoint[], fillColor: string, strokeColor?: string): void;
	
	close(): void;
}