import { Position } from './position';

export class Token {
	public static Type = {
		INT: 'INT',
		FLOAT: 'FLOAT',      ///> 虽然名称为“float”，但实际上全都是双精度浮点型
		STRING: 'STRING',
		IDENT: 'IDENT',
		KEYWORD: 'KEYWORD',

		NE: 'NE',   // 不等于号“!=”
		EE: 'EE',   // 逻辑表达式的等于号“==”
		GT: 'GT',   // >
		LT: 'LT',   // <
		GTE: 'GTE',  // >=
		LTE: 'LTE',  // <=

		PLUS: 'PLUS',
		MINUS: 'MINUS',
		MUL: 'MUL',
		DIV: 'DIV',
		MOD: 'MOD',        ///> 百分号”%“，默认为求余符号
		POW: 'POW',

		LPAREN: 'LPAREN',     ///> 左圆括号 ()
		RPAREN: 'RPAREN',
		LBRACKET: 'LBRACKET',   ///> 左方括号 []
		RBRACKET: 'RBRACKET',
		LBRACE: 'LBRACE',     ///> 左花括号 {}
		RBRACE: 'RBRACE',
		EQ: 'EQ',         ///> 赋值语句的等于号“=”


		COLON: 'COLON',      ///> “:”
		COMMA: 'COMMA',      ///> “,”
		DOT: 'DOT',        ///> "."

		EF: 'EF',         ///> end of file
		EL: 'EL',         ///> end of line 有两种表达字符：“;” and “\n”
	};

	protected position: Position;
	protected type: string;
	protected value: string;

	public constructor(type: string, position: Position, value = '') {
		this.position = position;
		this.value = value;
		this.type = type;
	}
	public getType() {
		return this.type;
	}
	public thisPosition() {
		return this.position;
	}
	public getValue() {
		return this.value;
	}
	public match(type: string, value: string): boolean {
		return this.type === type && this.value === value;
	}
}