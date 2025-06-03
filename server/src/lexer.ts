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

	"private",
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

	private advance() {
		if(this.position >= this.code.length) {return;}
		this.position++;
		this.currentChar = this.code.charAt(this.position);
	}
	private buildNumber() {
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

		this.tokens.push(new Token(tp, posStart, this.code.substring(posStart, this.position), this.position));
	}

	private buildGreaterThan() {
		const posStart: number = this.position;
		let tp: string = Token.Type.GT;

		this.advance();

		if(this.position < this.code.length && this.currentChar === '=') {
			tp = Token.Type.GTE;
			this.advance();
		}

		this.tokens.push(new Token(tp, posStart, '', this.position));
	}

	private buildLessThan() {
		const posStart: number = this.position;
		let tp: string = Token.Type.LT;

		this.advance();

		if(this.position < this.code.length && this.currentChar === '=') {
			tp = Token.Type.LTE;
			this.advance();
		}

		this.tokens.push(new Token(tp, posStart, '', this.position));
	}

	private buildEqation() {
		const posStart: number = this.position;
		let tp: string = Token.Type.EQ;

		this.advance();

		if(this.position < this.code.length && this.currentChar === '=') {
			tp = Token.Type.EE;
			this.advance();
		}

		this.tokens.push(new Token(tp, posStart, '', this.position));
	}

	private buildIdentifier() {
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
		this.tokens.push(new Token(tp, posStart, value, this.position));

	}

	private buildString() {
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
		this.tokens.push(new Token(Token.Type.STRING, posStart, str, this.position));
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
				this.tokens.push(new Token(Token.Type.EL, this.position, this.currentChar));
				this.advance();
			} else if(this.currentChar === '+') {
				this.tokens.push(new Token(Token.Type.PLUS, this.position));
				this.advance();
			} else if(this.currentChar === '-') {
				this.tokens.push(new Token(Token.Type.MINUS, this.position));
				this.advance();
			} else if(this.currentChar === '*') {
				this.tokens.push(new Token(Token.Type.MUL, this.position));
				this.advance();
			} else if(this.currentChar === '/') {
				this.tokens.push(new Token(Token.Type.DIV, this.position));
				this.advance();
			} else if(this.currentChar === '%') {
				this.tokens.push(new Token(Token.Type.MOD, this.position));
				this.advance();
			} else if(this.currentChar === '^') {
				this.tokens.push(new Token(Token.Type.POW, this.position));
				this.advance();
			} else if(this.currentChar === '(') {
				this.tokens.push(new Token(Token.Type.LPAREN, this.position));
				this.advance();
			} else if(this.currentChar === ')') {
				this.tokens.push(new Token(Token.Type.RPAREN, this.position));
				this.advance();
			} else if(this.currentChar === '[') {
				this.tokens.push(new Token(Token.Type.LBRACKET, this.position));
				this.advance();
			} else if(this.currentChar === ']') {
				this.tokens.push(new Token(Token.Type.RBRACKET, this.position));
				this.advance();
			} else if(this.currentChar === '{') {
				this.tokens.push(new Token(Token.Type.LBRACE, this.position));
				this.advance();
			} else if(this.currentChar === '}') {
				this.tokens.push(new Token(Token.Type.RBRACE, this.position));
				this.advance();
			} else if(this.currentChar === ':') {
				this.tokens.push(new Token(Token.Type.COLON, this.position));
				this.advance();
			} else if(this.currentChar === ',') {
				this.tokens.push(new Token(Token.Type.COMMA, this.position));
				this.advance();
			}
		}
		this.tokens.push(new Token(Token.Type.EF, this.position));
		return this.tokens;
	}
}