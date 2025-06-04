import { Position } from './position';
import { Token } from './token';

export const keywordSet = new Set([
	"not",
	"and",
	"or",

	"if",
	"elif",
	"else",

	"for",
	"from",
	"to",
	"step",
	"while",

	"public",
	"var"
]);

export enum LegalChar {
	OTHER = 0,
	DIGITAL = 1,
	HEX_DIGITAL = 2,
	LOWERCASE = 4,
	UPPERCASE = 8,
	UNDERLINE = 16,
	BLANK = 32
};

export function whatIsThis(c: string, target?: number): number | boolean {
	let res = 0;
	const charCode = c.charCodeAt(0);
	if (charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0)) {res |= LegalChar.DIGITAL;}
	if((charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0)) || 
		(charCode >= 'a'.charCodeAt(0) && charCode <= 'f'.charCodeAt(0)) ||
		(charCode >= 'A'.charCodeAt(0) && charCode <= 'F'.charCodeAt(0))) {res |= LegalChar.HEX_DIGITAL;}
	if(charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) {res |= LegalChar.LOWERCASE;}
	if(charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0)) {res |= LegalChar.UPPERCASE;}
	if(charCode === '_'.charCodeAt(0)) {res |= LegalChar.UNDERLINE;}
	if(charCode === ' '.charCodeAt(0)) {res |= LegalChar.BLANK;}
	
	if(target) {
		return (res & target) !== 0;
	}
	return res;
}

export class Lexer {

	protected position: number;
	protected currentChar: string;
	protected code: string;
	protected tokens: Token[];

	public constructor(code: string) {
		this.position = 0;
		this.code = code;
		this.tokens = [];
		this.currentChar = '';
		if(code.length > 0) {this.currentChar = code.charAt(this.position);}
		this.run();
	}

	public getTokens(): Token[] {
		return this.tokens;
	}

	public advance() {
		if(this.position >= this.code.length) {return;}
		this.position++;
		this.currentChar = this.code.charAt(this.position);
	}
	public buildNumber() {
		const posStart: number = this.position;
		let counter = 0;
		let tp: string = Token.Type.INT;
		while(this.position < this.code.length && 
			(whatIsThis(this.currentChar, LegalChar.DIGITAL) || this.currentChar === '.')
		) {
			if(this.currentChar === '.') {
				if(counter === 1) {break;}
				tp = Token.Type.FLOAT;
				counter ++;
			}
			this.advance();
		}

		this.tokens.push(new Token(tp, new Position(posStart, this.position), this.code.substring(posStart, this.position)));
	}

	public buildGreaterThan() {
		const posStart: number = this.position;
		let tp: string = Token.Type.GT;

		this.advance();

		if(this.position < this.code.length && this.currentChar === '=') {
			tp = Token.Type.GTE;
			this.advance();
		}

		this.tokens.push(new Token(tp, new Position(posStart, this.position), ''));
	}

	public buildLessThan() {
		const posStart: number = this.position;
		let tp: string = Token.Type.LT;

		this.advance();

		if(this.position < this.code.length && this.currentChar === '=') {
			tp = Token.Type.LTE;
			this.advance();
		}

		this.tokens.push(new Token(tp, new Position(posStart, this.position), ''));
	}

	public buildEqation() {
		const posStart: number = this.position;
		let tp: string = Token.Type.EQ;

		this.advance();

		if(this.position < this.code.length && this.currentChar === '=') {
			tp = Token.Type.EE;
			this.advance();
		}

		this.tokens.push(new Token(tp, new Position(posStart, this.position), ''));
	}

	public buildIdentifier() {
		const posStart: number = this.position;
		let tp: string = Token.Type.IDENT;

		this.advance();

		while(this.position < this.code.length && (whatIsThis(this.currentChar, LegalChar.DIGITAL | LegalChar.UPPERCASE | LegalChar.LOWERCASE | LegalChar.UNDERLINE))) {
			this.advance();
		}

		const value: string = this.code.substring(posStart, this.position);
		if(keywordSet.has(value)) {
			tp = Token.Type.KEYWORD;
		}
		this.tokens.push(new Token(tp, new Position(posStart, this.position), value));

	}

	public buildString() {
		let str = "";
		const posStart: number = this.position;
		this.advance();
		const transChar = new Map([
			['n', '\n'],
			['t', '\t'],
			['\\', '\\'],
			['"', '"']
		]);

		while(this.position < this.code.length && this.currentChar !== '"') {
			if(this.currentChar === '\\') {
				this.advance();
				const trans: string | undefined = transChar.get(this.currentChar);
				if(trans !== undefined) {
					str += trans;
				} else {
					str += ' ';
				}
			} else {
				str +=this.currentChar;
			}
			this.advance();
		}
		this.advance();
		this.tokens.push(new Token(Token.Type.STRING, new Position(posStart, this.position), str));
	}

	public run(): Token[] {
		while(this.position < this.code.length) {
			if(this.currentChar === ' ' || this.currentChar === '\t') {
				this.advance();
			} else if(whatIsThis(this.currentChar, LegalChar.DIGITAL)) {
				this.buildNumber();
			} else if(whatIsThis(this.currentChar, LegalChar.UNDERLINE | LegalChar.UPPERCASE | LegalChar.LOWERCASE)) {
				this.buildIdentifier();
			} else if(this.currentChar === '>') {
				this.buildGreaterThan();
			} else if(this.currentChar === '<') {
				this.buildLessThan();
			} else if(this.currentChar === '=') {
				this.buildEqation();
			} else if(this.currentChar === '"') {
				this.buildString();
			} else if(this.currentChar === '\n' || this.currentChar === ';') {
				this.tokens.push(new Token(Token.Type.EL, new Position(this.position, this.position + 1), this.currentChar));
				this.advance();
			} else if(this.currentChar === '+') {
				this.tokens.push(new Token(Token.Type.PLUS, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '-') {
				this.tokens.push(new Token(Token.Type.MINUS, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '*') {
				this.tokens.push(new Token(Token.Type.MUL, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '/') {
				this.tokens.push(new Token(Token.Type.DIV, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '%') {
				this.tokens.push(new Token(Token.Type.MOD, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '^') {
				this.tokens.push(new Token(Token.Type.POW, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '(') {
				this.tokens.push(new Token(Token.Type.LPAREN, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === ')') {
				this.tokens.push(new Token(Token.Type.RPAREN, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '[') {
				this.tokens.push(new Token(Token.Type.LBRACKET, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === ']') {
				this.tokens.push(new Token(Token.Type.RBRACKET, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '{') {
				this.tokens.push(new Token(Token.Type.LBRACE, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === '}') {
				this.tokens.push(new Token(Token.Type.RBRACE, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === ':') {
				this.tokens.push(new Token(Token.Type.COLON, new Position(this.position, this.position + 1)));
				this.advance();
			} else if(this.currentChar === ',') {
				this.tokens.push(new Token(Token.Type.COMMA, new Position(this.position, this.position + 1)));
				this.advance();
			} else {
				throw new Error(`Unrecognized Character '${this.currentChar}' (${this.currentChar.charCodeAt(0)})`);
			}
		}
		this.tokens.push(new Token(Token.Type.EF, new Position(this.position, this.position + 1)));
		return this.tokens;
	}
}
