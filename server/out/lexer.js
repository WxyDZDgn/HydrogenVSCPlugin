"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.LegalChar = exports.keywordSet = void 0;
exports.whatIsThis = whatIsThis;
const token_1 = require("./token");
exports.keywordSet = new Set([
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
var LegalChar;
(function (LegalChar) {
    LegalChar[LegalChar["OTHER"] = 0] = "OTHER";
    LegalChar[LegalChar["DIGITAL"] = 1] = "DIGITAL";
    LegalChar[LegalChar["HEX_DIGITAL"] = 2] = "HEX_DIGITAL";
    LegalChar[LegalChar["LOWERCASE"] = 4] = "LOWERCASE";
    LegalChar[LegalChar["UPPERCASE"] = 8] = "UPPERCASE";
    LegalChar[LegalChar["UNDERLINE"] = 16] = "UNDERLINE";
    LegalChar[LegalChar["BLANK"] = 32] = "BLANK";
})(LegalChar || (exports.LegalChar = LegalChar = {}));
;
function whatIsThis(c, target) {
    let res = 0;
    const charCode = c.charCodeAt(0);
    if (charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0)) {
        res |= LegalChar.DIGITAL;
    }
    if ((charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0)) ||
        (charCode >= 'a'.charCodeAt(0) && charCode <= 'f'.charCodeAt(0)) ||
        (charCode >= 'A'.charCodeAt(0) && charCode <= 'F'.charCodeAt(0))) {
        res |= LegalChar.HEX_DIGITAL;
    }
    if (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) {
        res |= LegalChar.LOWERCASE;
    }
    if (charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0)) {
        res |= LegalChar.UPPERCASE;
    }
    if (charCode === '_'.charCodeAt(0)) {
        res |= LegalChar.UNDERLINE;
    }
    if (charCode === ' '.charCodeAt(0)) {
        res |= LegalChar.BLANK;
    }
    if (target) {
        return (res & target) !== 0;
    }
    return res;
}
class Lexer {
    constructor(code) {
        this.position = 0;
        this.code = code;
        this.tokens = [];
        this.currentChar = '';
        if (code.length > 0) {
            this.currentChar = code.charAt(this.position);
        }
        this.run();
    }
    getTokens() {
        return this.tokens;
    }
    advance() {
        if (this.position >= this.code.length) {
            return;
        }
        this.position++;
        this.currentChar = this.code.charAt(this.position);
    }
    buildNumber() {
        const posStart = this.position;
        let counter = 0;
        let tp = token_1.Token.Type.INT;
        while (this.position < this.code.length &&
            (whatIsThis(this.currentChar, LegalChar.DIGITAL) || this.currentChar === '.')) {
            if (this.currentChar === '.') {
                if (counter === 1) {
                    break;
                }
                tp = token_1.Token.Type.FLOAT;
                counter++;
            }
            this.advance();
        }
        this.tokens.push(new token_1.Token(tp, posStart, this.code.substring(posStart, this.position), this.position));
    }
    buildGreaterThan() {
        const posStart = this.position;
        let tp = token_1.Token.Type.GT;
        this.advance();
        if (this.position < this.code.length && this.currentChar === '=') {
            tp = token_1.Token.Type.GTE;
            this.advance();
        }
        this.tokens.push(new token_1.Token(tp, posStart, '', this.position));
    }
    buildLessThan() {
        const posStart = this.position;
        let tp = token_1.Token.Type.LT;
        this.advance();
        if (this.position < this.code.length && this.currentChar === '=') {
            tp = token_1.Token.Type.LTE;
            this.advance();
        }
        this.tokens.push(new token_1.Token(tp, posStart, '', this.position));
    }
    buildEqation() {
        const posStart = this.position;
        let tp = token_1.Token.Type.EQ;
        this.advance();
        if (this.position < this.code.length && this.currentChar === '=') {
            tp = token_1.Token.Type.EE;
            this.advance();
        }
        this.tokens.push(new token_1.Token(tp, posStart, '', this.position));
    }
    buildIdentifier() {
        const posStart = this.position;
        let tp = token_1.Token.Type.IDENT;
        this.advance();
        while (this.position < this.code.length && (whatIsThis(this.currentChar, LegalChar.DIGITAL | LegalChar.UPPERCASE | LegalChar.LOWERCASE | LegalChar.UNDERLINE))) {
            this.advance();
        }
        const value = this.code.substring(posStart, this.position);
        if (exports.keywordSet.has(value)) {
            tp = token_1.Token.Type.KEYWORD;
        }
        this.tokens.push(new token_1.Token(tp, posStart, value, this.position));
    }
    buildString() {
        let str = "";
        const posStart = this.position;
        this.advance();
        const transChar = new Map([
            ['n', '\n'],
            ['t', '\t'],
            ['\\', '\\'],
            ['"', '"']
        ]);
        while (this.position < this.code.length && this.currentChar !== '"') {
            if (this.currentChar === '\\') {
                this.advance();
                const trans = transChar.get(this.currentChar);
                if (trans !== undefined) {
                    str += trans;
                }
                else {
                    str += ' ';
                }
            }
            else {
                str += this.currentChar;
            }
            this.advance();
        }
        this.advance();
        this.tokens.push(new token_1.Token(token_1.Token.Type.STRING, posStart, str, this.position));
    }
    run() {
        while (this.position < this.code.length) {
            if (this.currentChar === ' ' || this.currentChar === '\t') {
                this.advance();
            }
            else if (whatIsThis(this.currentChar, LegalChar.DIGITAL)) {
                this.buildNumber();
            }
            else if (whatIsThis(this.currentChar, LegalChar.UNDERLINE | LegalChar.UPPERCASE | LegalChar.LOWERCASE)) {
                this.buildIdentifier();
            }
            else if (this.currentChar === '>') {
                this.buildGreaterThan();
            }
            else if (this.currentChar === '<') {
                this.buildLessThan();
            }
            else if (this.currentChar === '=') {
                this.buildEqation();
            }
            else if (this.currentChar === '"') {
                this.buildString();
            }
            else if (this.currentChar === '\n' || this.currentChar === ';') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.EL, this.position, this.currentChar));
                this.advance();
            }
            else if (this.currentChar === '+') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.PLUS, this.position));
                this.advance();
            }
            else if (this.currentChar === '-') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.MINUS, this.position));
                this.advance();
            }
            else if (this.currentChar === '*') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.MUL, this.position));
                this.advance();
            }
            else if (this.currentChar === '/') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.DIV, this.position));
                this.advance();
            }
            else if (this.currentChar === '%') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.MOD, this.position));
                this.advance();
            }
            else if (this.currentChar === '^') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.POW, this.position));
                this.advance();
            }
            else if (this.currentChar === '(') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.LPAREN, this.position));
                this.advance();
            }
            else if (this.currentChar === ')') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.RPAREN, this.position));
                this.advance();
            }
            else if (this.currentChar === '[') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.LBRACKET, this.position));
                this.advance();
            }
            else if (this.currentChar === ']') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.RBRACKET, this.position));
                this.advance();
            }
            else if (this.currentChar === '{') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.LBRACE, this.position));
                this.advance();
            }
            else if (this.currentChar === '}') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.RBRACE, this.position));
                this.advance();
            }
            else if (this.currentChar === ':') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.COLON, this.position));
                this.advance();
            }
            else if (this.currentChar === ',') {
                this.tokens.push(new token_1.Token(token_1.Token.Type.COMMA, this.position));
                this.advance();
            }
        }
        this.tokens.push(new token_1.Token(token_1.Token.Type.EF, this.position));
        return this.tokens;
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map