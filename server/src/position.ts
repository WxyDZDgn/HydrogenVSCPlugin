export class Position {
	protected start: number;
	protected end: number;
	public constructor(start = 0, end = 0) {
		this.start = start;
		this.end = end;
	}
	public getStart() {
		return this.start;
	}
	public getEnd() {
		return this.end;
	}
	public setStart(start: number) {
		this.start = start;
	}
	public setEnd(end: number) {
		this.end = end;
	}
}