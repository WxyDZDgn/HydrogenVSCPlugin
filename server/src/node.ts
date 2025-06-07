import { assert } from 'chai';
import { Environment } from './environment';
import { Position } from './position';
import { Token } from './token';

import { Degree } from './test';

/**********************************************
 * Node
 **********************************************/

export class Node {
	protected position: Position;
	protected environment: Environment | null;
	public constructor(position = new Position(), environment: Environment | null = null) {
		this.position = position;
		this.environment = environment;
	}
	public thisPosition() {
		return this.position;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, Node);
		if(degree >= Degree.MID) {
			;
		}
		if(degree >= Degree.HIGH) {
			assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
		}
	}
}

/**********************************************
 * StmtNode
 **********************************************/

export class AssignNode extends Node {
	protected name: string;
	protected lVal: Node;
	protected rVal: Node;
	public constructor(name: string, lVal: Node, rVal: Node, position = new Position()) {
		super(position);
		this.name = name;
		this.lVal = lVal;
		this.rVal = rVal;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, AssignNode);
		if(node instanceof AssignNode) {
			this.lVal.checkNode(node.lVal, degree);
			this.rVal.checkNode(node.rVal, degree);
			if(degree >= Degree.MID) {
				assert.strictEqual(this.name, node.name);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class DefNode extends Node {
	protected name: string;
	protected val: Node;
	public constructor(name = '', val: Node, position = new Position()) {
		super(position);
		this.name = name;
		this.val = val;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, DefNode);
		if(node instanceof DefNode) {
			this.val.checkNode(node.val, degree);
			if(degree >= Degree.MID) {
				assert.strictEqual(this.name, node.name);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class IfStmtNode extends Node {
	protected cond: Node[];
	protected exeUnit: Node[];
	protected elseExeUnit: Node | null;
	public constructor(cond: Node[] = [], exeUnit: Node[] = [], elseExeUnit: Node | null = null) {
		super();
		this.cond = cond;
		this.exeUnit = exeUnit;
		this.elseExeUnit = elseExeUnit;
	}
	public addBranch(cond: Node, exeUnit: Node) {
		this.cond.push(cond);
		this.exeUnit.push(exeUnit);
	}
	public addElseBranch(exeUnit: Node) {
		this.elseExeUnit = exeUnit;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, IfStmtNode);
		if(node instanceof IfStmtNode) {
			assert.strictEqual(this.cond.length, node.cond.length);
			for(let i = 0; i < this.cond.length; i++) {
				this.cond[i].checkNode(node.cond[i], degree);
			}
			assert.strictEqual(this.exeUnit.length, node.exeUnit.length);
			for(let i = 0; i < this.exeUnit.length; i++) {
				this.exeUnit[i].checkNode(node.exeUnit[i], degree);
			}

			if(degree >= Degree.MID) {
				if(this.elseExeUnit && node.elseExeUnit) {
					this.elseExeUnit.checkNode(node.elseExeUnit, degree);
				} else {
					assert.equal(this.elseExeUnit, node.elseExeUnit);
				}
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class WhileStmtNode extends Node {
	protected cond: Node;
	protected loopUnit: Node;
	public constructor(cond: Node, loopUnit: Node, position = new Position()) {
		super(position);
		this.cond = cond;
		this.loopUnit = loopUnit;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, WhileStmtNode);
		if(node instanceof WhileStmtNode) {
			this.cond.checkNode(node.cond, degree);
			this.loopUnit.checkNode(node.loopUnit, degree);
			if(degree >= Degree.MID) {
				;
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class StatementsNode extends Node {
	protected statements: Node[];
	public constructor(position = new Position(), environment: Environment | null = null) {
		super(position, environment);
		this.statements = [];
	}
	public append(node: Node) {
		this.statements.push(node);
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, StatementsNode);
		if(node instanceof StatementsNode) {
			assert.strictEqual(this.statements.length, node.statements.length);
			for(let i = 0; i < this.statements.length; i++) {
				this.statements[i].checkNode(node.statements[i], degree);
			}
			if(degree >= Degree.MID) {
				;
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

/**********************************************
 * UnitNode
 **********************************************/

export class ExeUnitNode extends Node {
	protected list: Node[];
	public constructor(list: Node[] = [], position = new Position()) {
		super(position);
		this.list = list;
	}
	public getList() {
		return this.list;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, ExeUnitNode);
		if(node instanceof ExeUnitNode) {
			assert.strictEqual(this.list.length, node.list.length);
			for(let i = 0; i < this.list.length; i++) {
				this.list[i].checkNode(node.list[i], degree);
			}
			if(degree >= Degree.MID) {
				;
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

/**********************************************
 * BinaryOperatorNode
 **********************************************/

export class PostfixNode extends Node {
	protected type: string;
	protected primary: Node;
	protected ident: string;
	protected exprList: Node[];
	public constructor(type = '', primary: Node, ident = '', exprList: Node[] = [], position = new Position()) {
		super(position);
		this.type = type;
		this.primary = primary;
		this.ident = ident;
		this.exprList = exprList;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, PostfixNode);

		if(node instanceof PostfixNode) {
			this.primary.checkNode(node.primary, degree);
			assert.strictEqual(this.exprList.length, node.exprList.length);
			for(let i = 0; i < this.exprList.length; i++) {
				this.exprList[i].checkNode(node.exprList[i], degree);
			}
			if(degree >= Degree.MID) {
				assert.strictEqual(this.type, node.type);
				assert.strictEqual(this.ident, node.ident);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class BinOperNode extends Node {
	protected oper: Token;
	protected left: Node;
	protected right: Node;
	public constructor(oper: Token, left: Node, right: Node, pos = new Position()) {
		super(pos);
		this.oper = oper;
		this.left = left;
		this.right = right;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, BinOperNode);
		if(node instanceof BinOperNode) {
			this.oper.checkToken(node.oper, degree);
			this.left.checkNode(node.left, degree);
			this.right.checkNode(node.right, degree);
			if(degree >= Degree.MID) {
				;
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

/**********************************************
 * ObjectNode
 **********************************************/

export class ObjectNode extends Node {
	protected className: string;
	public constructor(className = '', position = new Position(), environment = new Environment()) {
		super(position, environment);
		this.className = className;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, ObjectNode);
		if(node instanceof ObjectNode) {
			if(degree >= Degree.MID) {
				assert.strictEqual(this.className, node.className);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class IntNode extends ObjectNode {
	protected val: number;
	public constructor(val: number, position = new Position()) {
		super('Integer', position);
		this.val = val;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, IntNode);
		if(node instanceof IntNode) {
			if(degree >= Degree.MID) {
				assert.strictEqual(this.val, node.val);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class IdentNode extends Node {
	protected ident: string;
	public constructor(ident: string, position = new Position()) {
		super(position);
		this.ident = ident;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, IdentNode);
		if(node instanceof IdentNode) {
			if(degree >= Degree.MID) {
				assert.strictEqual(this.ident, node.ident);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class StrNode extends ObjectNode {
	protected value: string;
	public constructor(value = '', position = new Position(), environment = new Environment()) {
		super('String', position, environment);
		this.value = value;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, StrNode);
		if(node instanceof StrNode) {
			if(degree >= Degree.MID) {
				assert.strictEqual(this.value, node.value);
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class FuncObjNode extends ObjectNode {
	protected args: string[];
	protected body: Node;
	public constructor(args: string[], body: Node, pos: Position) {
		super('', pos);
		this.args = args;
		this.body = body;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, FuncObjNode);
		if(node instanceof FuncObjNode) {
			this.body.checkNode(node.body, degree);
			if(degree >= Degree.MID) {
				assert.strictEqual(this.args.length, node.args.length);
				for(let i = 0; i < this.args.length; i++) {
					assert.strictEqual(this.args[i], node.args[i]);
				}
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}

export class ListObjNode extends ObjectNode {
	protected exprList: Node[];
	public constructor(exprList: Node[], pos = new Position()) {
		super('', pos);
		this.exprList = exprList;
	}
	public checkNode(node: Node, degree: number) {
		assert.strictEqual(this.constructor, node.constructor);
		assert.strictEqual(this.constructor, ListObjNode);
		if(node instanceof ListObjNode) {
			assert.strictEqual(this.exprList.length, node.exprList.length);
			for(let i = 0; i < this.exprList.length; i++) {
				this.exprList[i].checkNode(node.exprList[i], degree);
			}
			if(degree >= Degree.MID) {
				;
			}
			if(degree >= Degree.HIGH) {
				assert.deepStrictEqual(this.thisPosition(), node.thisPosition());
			}
		}
	}
}