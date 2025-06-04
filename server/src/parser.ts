import { Environment } from './environment';
import { AssignNode, ExeUnitNode, IdentNode, IntNode, Node, PostfixNode, StrNode } from './node';
import { Position } from './position';
import { Token } from './token';

export class Parser {
	protected tokens: Token[];
	protected environment: Environment;
	protected currentToken: number;
	protected resultNode: Node | null;
	public constructor(tokens: Token[], environment: Environment) {
		this.tokens = tokens;
		this.environment = environment;
		this.currentToken = 0;
		this.resultNode = null;
	}
	public advance() {
		if (this.tokens[this.currentToken].getType() !== Token.Type.EF) { this.currentToken++; }
	}
	public ExeUnit(): Node {
		while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
		if (this.tokens[this.currentToken].getType() !== Token.Type.LBRACE) {
			// TODO: 添加错误提示
		} else { this.advance(); }

		const unit = new ExeUnitNode();
		while (this.tokens[this.currentToken].getType() !== Token.Type.RBRACE) {
			if (this.tokens[this.currentToken].getType() === Token.Type.EL) {
				this.advance();
				continue;
			}
			const resOpt: Node | null = this.assignStmt();
			if (resOpt) {
				while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
				unit.getList().push(resOpt);
			}

			let stmt: Node | null = null;

			stmt = this.ifStmt();
			if (stmt) {
				while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
				unit.getList().push(stmt);
				continue;
			}

			stmt = this.whileStmt();
			if (stmt) {
				while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
				unit.getList().push(stmt);
				continue;
			}

			stmt = this.funcDef();
			if (stmt) {
				while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
				unit.getList().push(stmt);
				continue;
			}

			stmt = this.varDef();
			if (stmt) {
				while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
				unit.getList().push(stmt);
				continue;
			}

			stmt = this.expr();
			if (stmt) {
				while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
				unit.getList().push(stmt);
				continue;
			}
		}
		this.advance();
		return unit;
	}
	public assignStmt(): Node | null {
		const pos = new Position();
		pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

		const start = this.currentToken;

		const resOpt: Node | null = this.postfixExpr();
		if (!resOpt) { return null; }
		const lVal: Node = resOpt;

		if (this.tokens[this.currentToken].getType() !== Token.Type.EQ) {
			this.currentToken = start;
			return null;
		}
		this.advance();

		const rVal = this.expr();

		pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
		return new AssignNode('', lVal, rVal, pos);
	}
	public postfixExpr(): Node | null {
		const pos = new Position();
		pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

		const resOpt: Node | null = this.primary();
		if (!resOpt) { return null; }
		let primary: Node = resOpt;

		let flag = true;
		while (flag) {
			switch (this.tokens[this.currentToken].getType()) {
				case Token.Type.LPAREN: { // 圆括号 ()
					this.advance();
					let params: Node[] = [];

					if (this.tokens[this.currentToken].getType() !== Token.Type.RPAREN) {
						params = this.exprArray();
					}
					this.advance();

					pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
					primary = new PostfixNode(Token.Type.LPAREN, primary, '', params, pos);
					break;
				}
				case Token.Type.LBRACKET: { // 方括号 []
					this.advance();
					let params: Node[] = [];

					if (this.tokens[this.currentToken].getType() !== Token.Type.RBRACKET) {
						params = this.exprArray();
					}
					this.advance();

					pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
					primary = new PostfixNode(Token.Type.LBRACKET, primary, '', params, pos);
					break;
				}
				case Token.Type.DOT: {  // 点号 .

					break;
				}
				default: {
					flag = false;
					break;
				}
			}
		}

		return primary;
	}
	public primary(): Node | null {
		let node = new Node();

        switch (this.tokens[this.currentToken].getType()){
            case Token.Type.INT: {
                const val = parseInt(this.tokens[this.currentToken].getValue());
                const pos = this.tokens[this.currentToken].thisPosition();

				const node = new IntNode(val, pos);
                this.advance();
                return node;
            }
            case Token.Type.IDENT: {
                const name = this.tokens[this.currentToken].getValue();
                this.advance();

                return new IdentNode(name);
            }
            case Token.Type.LPAREN: {
                // let pos = this.tokens[this.currentToken].thisPosition();
				// pos = new Position(pos.getStart(), pos.getEnd());
                this.advance();

                node = this.expr();

                if (this.tokens[this.currentToken].getType() != Token.Type.RPAREN) {
                    // assert(false && "Throw Error! Expect ')'."); 
					// Todo: 添加错误列表
                } else {this.advance();}
                return node;
            }
            case Token.Type.STRING: {
                const pos = new Position();
                pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());
                const val = this.tokens[this.currentToken].getValue();
                this.advance();

                pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
                return new StrNode(val, pos);
            }
            default: {
                 return null;
            }
        }
	}

	// Todo: 完成以下内容
	public ifStmt(): Node {
		return new Node();
	}
	public whileStmt(): Node {
		return new Node();
	}
	public funcDef(): Node {
		return new Node();
	}
	public varDef(): Node {
		return new Node();
	}
	public expr(): Node {
		return new Node();
	}
	public exprArray(): Node[] {
		return [new Node()];
	}
}
