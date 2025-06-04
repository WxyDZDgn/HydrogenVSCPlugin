import { TypeObject } from './object';

export class Environment {
	public static Mode = {
		GLOBAL: 0,
		LOCAL: 1
	};

	protected parent: Environment | null;
	protected symbolTable: Map<string, TypeObject>;
	protected moduleName: string;

	public constructor(parent: Environment | null = null, moduleName = '') {
		this.parent = parent;
		this.moduleName = moduleName;
		this.symbolTable = new Map<string, TypeObject>();
	};

	public getModuleName(): string {
		return this.moduleName;
	}

	public setSymbol(name: string, value: TypeObject, mode: number) {
		if(mode === Environment.Mode.GLOBAL) {
			const stack: Environment[] = [this];
			let iter: Environment | null = stack[0];
			while(iter !== null) {
				stack.push(iter);
				iter = iter.parent;
			}
			while(stack.length > 0) {
				iter = stack.pop()!;
				if(iter.symbolTable.has(name)) {break;}
			}
			iter!.symbolTable.set(name, value);

		} else {
			this.symbolTable.set(name, value);
		}
	}

}