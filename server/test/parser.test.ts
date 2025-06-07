import { describe, it } from 'mocha';

import { Degree } from '../src/test';

import { Lexer } from './../src/lexer';
import { Parser } from './../src/parser';
import { BinOperNode, DefNode, ExeUnitNode, IdentNode, IfStmtNode, IntNode, ListObjNode, Node, StrNode } from './../src/node';
import { Token } from '../src/token';

function checkCode(code: string, expectedNode: Node, degree: number, parserType: string, outputOnly = false) {
	const lexer = new Lexer(code);
	const actualTokens = lexer.getTokens();
	const parser = new Parser(actualTokens);

	let actualNode: Node | null = null;
	switch(parserType) {
		case Parser.Type.EXE_UNIT:
			actualNode = parser.exeUnit();
			break;
		case Parser.Type.EXPR:
			actualNode = parser.expr();
			break;
		case Parser.Type.IF_STMT:
			actualNode = parser.ifStmt();
			break;
		case Parser.Type.VAR_DEF:
			actualNode = parser.varDef();
	}
	if(!outputOnly) {
		actualNode!.checkNode(expectedNode, degree);
	} else {
		console.log(actualNode!);
	}
	
}

describe('Parser ExeUnit Test', () => {
	const globalParserType = Parser.Type.EXE_UNIT;
	const globalDegree = Degree.MID;
	it('String Oper 1 - String Assignment', () => {
		const code = 
`{
	var str = "123"
	str
}`;
		const exeUnit = new ExeUnitNode([
			new DefNode('str', new StrNode('123')),
			new IdentNode('str')
		]);
		checkCode(code, exeUnit, globalDegree, globalParserType);
	});

	it('String Oper 2 - String Split', () => {
		const code = 
`{
	var str = "12 34 56"
	var split = " "
	var list = str / split
	list
}`;
		const exeUnit = new ExeUnitNode([
			new DefNode('str', new StrNode('12 34 56')),
			new DefNode('split', new StrNode(' ')),
			new DefNode('list', new BinOperNode(new Token(Token.Type.DIV), new IdentNode('str'), new IdentNode('split'))),
			new IdentNode('list')
		]);
		checkCode(code, exeUnit, globalDegree, globalParserType);
	});

	it('String Oper 3 - String Append', () => {
		const code = 
`{
	var str = "12" + "34" + "56"
	str
}`;
		const exeUnit = new ExeUnitNode([
			new DefNode('str', new BinOperNode(new Token(Token.Type.PLUS), new BinOperNode(
				new Token(Token.Type.PLUS), new StrNode('12'), new StrNode('34')), new StrNode('56')
			)),
			new IdentNode('str')
		]);
		checkCode(code, exeUnit, globalDegree, globalParserType);
	});

	it('List Oper 1 - List Structure', () => {
		const code = 
`{
	var list = ["Hello, TS!"]
	list
}`;
		const exeUnit = new ExeUnitNode([
			new DefNode('list', new ListObjNode([new StrNode('Hello, TS!')])),
			new IdentNode('list')
		]);
		checkCode(code, exeUnit, globalDegree, globalParserType);
	});
});

describe('Parser Expr Test', () => {
	const globalParserType = Parser.Type.EXPR;
	const globalDegree = Degree.MID;

	it('Fundamental Expr 1 - Four Fundamental Operation Without Brackets', () => {
		const code = `4 + 3 * 2 - 8 / 2 * 4 + 1`;
		const expr = new BinOperNode(new Token(Token.Type.PLUS), new BinOperNode(
			new Token(Token.Type.MINUS), new BinOperNode(
				new Token(Token.Type.PLUS), new IntNode(4), new BinOperNode(
					new Token(Token.Type.MUL), new IntNode(3), new IntNode(2)
				)), new BinOperNode(
					new Token(Token.Type.MUL), new BinOperNode(
						new Token(Token.Type.DIV), new IntNode(8), new IntNode(2)
					), new IntNode(4)
				)
		), new IntNode(1));
		checkCode(code, expr, globalDegree, globalParserType);
	});
	it('Fundamental Expr 2 - Four Fundamental Operation With Nest Brackets', () => {
		const code = `1 + 3 * 2 * 9 / (2 + 4) - (2 - 3 * (9 + 10) * 8)`;
		const expr = new BinOperNode(
			new Token(Token.Type.MINUS), new BinOperNode(
				new Token(Token.Type.PLUS), new IntNode(1), new BinOperNode(
					new Token(Token.Type.DIV), new BinOperNode(
						new Token(Token.Type.MUL), new BinOperNode(
							new Token(Token.Type.MUL), new IntNode(3), new IntNode(2)
						), new IntNode(9)
					), new BinOperNode(
						new Token(Token.Type.PLUS), new IntNode(2), new IntNode(4)
					)
				)
			), new BinOperNode(
				new Token(Token.Type.MINUS), new IntNode(2), new BinOperNode(
					new Token(Token.Type.MUL), new BinOperNode(
						new Token(Token.Type.MUL), new IntNode(3), new BinOperNode(
							new Token(Token.Type.PLUS), new IntNode(9), new IntNode(10)
						)
					), new IntNode(8)
				)
			)
		);
		checkCode(code, expr, globalDegree, globalParserType);
	});

	it('Logical Expr 1 - Simple Logical Structure', () => {
		const code = `3 + 2 * 9 <= 6 - 8 / 4`;
		const expr = new BinOperNode(
			new Token(Token.Type.LTE), new BinOperNode(
				new Token(Token.Type.PLUS), new IntNode(3), new BinOperNode(
					new Token(Token.Type.MUL), new IntNode(2), new IntNode(9)
				)
			), new BinOperNode(
				new Token(Token.Type.MINUS), new IntNode(6), new BinOperNode(
					new Token(Token.Type.DIV), new IntNode(8), new IntNode(4)
				)
			)
		);
		checkCode(code, expr, globalDegree, globalParserType);
	});
	
	it('Logical Expr 2 - Complex Logical Structure', () => {
		const code = `3 <= 10 != 20 < 30 > 2 >= 2 < 4 == 4`;
		const expr = new BinOperNode(
			new Token(Token.Type.EE), new BinOperNode(
				new Token(Token.Type.LT), new BinOperNode(
					new Token(Token.Type.GTE), new BinOperNode(
						new Token(Token.Type.GT), new BinOperNode(
							new Token(Token.Type.LT), new BinOperNode(
								new Token(Token.Type.NE), new BinOperNode(
									new Token(Token.Type.LTE), new IntNode(3), new IntNode(10)
								), new IntNode(20)
							), new IntNode(30)
						), new IntNode(2)
					), new IntNode(2)
				), new IntNode(4)
			), new IntNode(4)
		);
		checkCode(code, expr, globalDegree, globalParserType);
	});

	it('All Together 1', () => {
		const code = `3 < (10 > (100 == 2) * 6 - 2 >= 9) <= 3 + 0 != (2 / 4)`;
		const expr = new BinOperNode(
			new Token(Token.Type.NE), new BinOperNode(
				new Token(Token.Type.LTE), new BinOperNode(
					new Token(Token.Type.LT), new IntNode(3), new BinOperNode(
						new Token(Token.Type.GTE), new BinOperNode(
							new Token(Token.Type.GT), new IntNode(10), new BinOperNode(
								new Token(Token.Type.MINUS), new BinOperNode(
									new Token(Token.Type.MUL), new BinOperNode(
										new Token(Token.Type.EE), new IntNode(100), new IntNode(2)
									), new IntNode(6)
								), new IntNode(2)
							)
						), new IntNode(9)
					)
				), new BinOperNode(
					new Token(Token.Type.PLUS), new IntNode(3), new IntNode(0)
				)
			), new BinOperNode(
				new Token(Token.Type.DIV), new IntNode(2), new IntNode(4)
			)
		);
		checkCode(code, expr, globalDegree, globalParserType);
	});
});

describe('Parser IfStmt Test', () => {
	const globalParserType = Parser.Type.IF_STMT;
	const globalDegree = Degree.MID;

	it('If Statement', () => {
		const code = 
`if 3 + 2 > 4 + 1 {
	"38324"
}`;
		const ifStmt = new IfStmtNode([
			new BinOperNode(
				new Token(Token.Type.GT), new BinOperNode(
					new Token(Token.Type.PLUS), new IntNode(3), new IntNode(2)
				), new BinOperNode(
					new Token(Token.Type.PLUS), new IntNode(4), new IntNode(1)
				)
			)
		], [
			new ExeUnitNode([
				new StrNode('38324')
			])
		]);
		checkCode(code, ifStmt, globalDegree, globalParserType);
	});
	it('If-Else Statement', () => {
		const code = 
`if 1 {
	"372466"
} else {
	"965837"
}
`;
		const ifStmt = new IfStmtNode([
			new IntNode(1)
		], [
			new ExeUnitNode([
				new StrNode('372466')
			])
		], new ExeUnitNode([
				new StrNode('965837')
			])
		);
		checkCode(code, ifStmt, globalDegree, globalParserType);
	});

	it('If-Elif-Else Statement', () => {
		const code = 
`if 0 {
	"372466"
} elif 1 {
	"965837"
} elif 2 {
	"38324"
} else {
	"14122"
}
`;
		const ifStmt = new IfStmtNode([
			new IntNode(0), new IntNode(1), new IntNode(2)
		], [
			new ExeUnitNode([
				new StrNode('372466')
			]), new ExeUnitNode([
				new StrNode('965837')
			]), new ExeUnitNode([
				new StrNode('38324')
			])
		], new ExeUnitNode([
				new StrNode('14122')
			])
		);
		checkCode(code, ifStmt, globalDegree, globalParserType);
	});
});

describe('Parser VarDef Test', () => {
	const globalParserType = Parser.Type.VAR_DEF;
	const globalDegree = Degree.MID;

	it('If Statement', () => {
		const code = 
`if 3 + 2 > 4 + 1 {
	"38324"
}`;
		const ifStmt = new IfStmtNode([
			new BinOperNode(
				new Token(Token.Type.GT), new BinOperNode(
					new Token(Token.Type.PLUS), new IntNode(3), new IntNode(2)
				), new BinOperNode(
					new Token(Token.Type.PLUS), new IntNode(4), new IntNode(1)
				)
			)
		], [
			new ExeUnitNode([
				new StrNode('38324')
			])
		]);
		checkCode(code, ifStmt, globalDegree, globalParserType);
	});
	it('If-Else Statement', () => {
		const code = 
`if 1 {
	"372466"
} else {
	"965837"
}
`;
		const ifStmt = new IfStmtNode([
			new IntNode(1)
		], [
			new ExeUnitNode([
				new StrNode('372466')
			])
		], new ExeUnitNode([
				new StrNode('965837')
			])
		);
		checkCode(code, ifStmt, globalDegree, globalParserType);
	});

	it('If-Elif-Else Statement', () => {
		const code = 
`if 0 {
	"372466"
} elif 1 {
	"965837"
} elif 2 {
	"38324"
} else {
	"14122"
}
`;
		const ifStmt = new IfStmtNode([
			new IntNode(0), new IntNode(1), new IntNode(2)
		], [
			new ExeUnitNode([
				new StrNode('372466')
			]), new ExeUnitNode([
				new StrNode('965837')
			]), new ExeUnitNode([
				new StrNode('38324')
			])
		], new ExeUnitNode([
				new StrNode('14122')
			])
		);
		checkCode(code, ifStmt, globalDegree, globalParserType);
	});
});
