import { Environment } from './environment';
import { Position } from './position';

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
}

/**********************************************
 * StmtNode
 **********************************************/

export class AssignNode extends Node {
	protected name: string;
	protected lVal: Node | null;
	protected rVal: Node | null;
	public constructor(name = '', lVal: Node | null = null, rVal: Node | null = null, position = new Position()) {
		super(position);
		this.name = name;
		this.lVal = lVal;
		this.rVal = rVal;
	}
}

export class DefNode extends Node {
	protected name: string;
	protected val: Node | null;
	public constructor(name = '', val = null, position = new Position()) {
		super(position);
		this.name = name;
		this.val = val;
	}
}

export class IfStmtNode extends Node {
	protected cond: Node[];
	protected exeUnit: Node[];
	public constructor() {
		super();
		this.cond = [];
		this.exeUnit = [];
	}
}

export class WhileStmtNode extends Node {
	protected cond: Node | null;
	protected loopUnit: Node | null;
	public constructor(cond: Node | null = null, loopUnit: Node | null = null, position = new Position()) {
		super(position);
		this.cond = cond;
		this.loopUnit = loopUnit;
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
}

/**********************************************
 * BinaryOperatorNode
 **********************************************/

export class PostfixNode extends Node {
	protected type: string;
	protected primary: Node | null;
	protected ident: string;
	protected exprList: Node[];
	public constructor(type = '', primary: Node | null = null, ident = '', exprList: Node[] = [], position = new Position()) {
		super(position);
		this.type = type;
		this.primary = primary;
		this.ident = ident;
		this.exprList = exprList;
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
}

export class IntNode extends ObjectNode {
	protected val: number;
	public constructor(val: number, position = new Position()) {
		super('Integer', position);
		this.val = val;
	}
}

export class IdentNode extends Node {
	protected ident: string;
	public constructor(ident: string, position = new Position()) {
		super(position);
		this.ident = ident;
	}
}

export class StrNode extends ObjectNode {
	protected value: string;
	public constructor(value = '', position = new Position(), environment = new Environment()) {
		super('String', position, environment);
		this.value = value;
	}
}