export class TypeObject {
	protected className: string;
	protected position: number;
	public constructor(className = "", position = 0) {
		this.className = className;
		this.position = position;
	}
}