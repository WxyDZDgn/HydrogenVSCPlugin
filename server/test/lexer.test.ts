import { assert } from 'chai';
import { describe, it } from 'mocha';

import { Token } from './../src/token';
import { Lexer } from './../src/lexer';
import { Degree } from './../src/test';

function check(code: string, expectedTokens: Token[], degree: number) {
	const lexer = new Lexer(code);
	const actualTokens = lexer.getTokens();

	assert.strictEqual(actualTokens.length, expectedTokens.length);
	for(let i = 0; i < actualTokens.length; i++) {
		actualTokens[i].checkToken(expectedTokens[i], degree);
	}
}

describe('lexer', () => {
	it('a = 1', () => {
		check('a = 1', [
			new Token(Token.Type.IDENT, 'a'),
			new Token(Token.Type.EQ),
			new Token(Token.Type.INT, '1'),
			new Token(Token.Type.EF),
		], Degree.MID);
	});

	it('a[1]', () => {
		check('a[1]', [
			new Token(Token.Type.IDENT, 'a'),
			new Token(Token.Type.LBRACKET, ''),
			new Token(Token.Type.INT, '1'),
			new Token(Token.Type.RBRACKET, ''),
			new Token(Token.Type.EF, '') 
		], Degree.MID);
	});

	it('var list = [1, 2]', () => {
		check('var list = [1, 2]', [
			new Token(Token.Type.KEYWORD, 'var'),
			new Token(Token.Type.IDENT, 'list'),
			new Token(Token.Type.EQ),
			new Token(Token.Type.LBRACKET),
			new Token(Token.Type.INT, '1'), 
			new Token(Token.Type.COMMA),
			new Token(Token.Type.INT, '2'),
			new Token(Token.Type.RBRACKET),
			new Token(Token.Type.EF, '') 
		], Degree.MID);
	});

	it('if', () => {
		check('if', [
			new Token(Token.Type.KEYWORD, 'if'),
			new Token(Token.Type.EF, '') 
		], Degree.MID);
	});

	it('9223372036854775807', () => {
		check('9223372036854775807', [
			new Token(Token.Type.INT, '9223372036854775807'),
			new Token(Token.Type.EF, '') 
		], Degree.MID);
	});

	it('if n == 9653 {}', () => {
		check('if n == 9653 {}', [
			new Token(Token.Type.KEYWORD, 'if'),
			new Token(Token.Type.IDENT, 'n'),
			new Token(Token.Type.EE),
			new Token(Token.Type.INT, '9653'),
			new Token(Token.Type.LBRACE), 
			new Token(Token.Type.RBRACE),
			new Token(Token.Type.EF) 
		], Degree.MID);
	});
});
