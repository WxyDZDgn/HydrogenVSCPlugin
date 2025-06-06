import { Environment } from './environment';
import { AssignNode, BinOperNode, DefNode, ExeUnitNode, FuncObjNode, IdentNode, IfStmtNode, IntNode, ListObjNode, Node, PostfixNode, StrNode, WhileStmtNode } from './node';
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
    public exeUnit(): Node {
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

        switch (this.tokens[this.currentToken].getType()) {
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
                } else { this.advance(); }
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
    public ifStmt(): Node | null {
        const ifStmtNode = new IfStmtNode();

        // 'if' Expr ExeUnit
        this.ignoreEL();

        if (!this.tokens[this.currentToken].match(Token.Type.KEYWORD, "if")) { return null; }

        const pos = ifStmtNode.thisPosition();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());
        this.advanceAndEL();

        let cond = this.expr();
        let exeUnit = this.exeUnit();
        ifStmtNode.addBranch(cond, exeUnit);


        // { 'elif' Expr ExeUnit }
        this.ignoreEL();
        while (this.tokens[this.currentToken].match(Token.Type.KEYWORD, "elif")) {
            this.advance();
            this.ignoreEL();
            cond = this.expr();
            exeUnit = this.exeUnit();
            ifStmtNode.addBranch(cond, exeUnit);
        }

        // ['else' ExeUnit ]
        this.ignoreEL();
        if (this.tokens[this.currentToken].match(Token.Type.KEYWORD, "else")) {
            this.advanceAndEL();
            exeUnit = this.exeUnit();
            ifStmtNode.addElseBranch(exeUnit);
        }

        pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
        return ifStmtNode;
    }
    public whileStmt(): Node | null {
        if (!this.tokens[this.currentToken].match(Token.Type.KEYWORD, "while")) { return null; }

        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());
        this.advance();

        const cond = this.expr();

        const loopUnit = this.exeUnit(); // hdgtodo: 后面应该支持 break

        pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
        return new WhileStmtNode(cond, loopUnit);
    }
    public funcDef(): Node | null {
        while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }

        // 1. 关键字 'function'
        if (!this.tokens[this.currentToken].match(Token.Type.KEYWORD, "function")) {
            return null;
        }
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());
        this.advance();

        // 2. 标识符 IDENT
        if (this.tokens[this.currentToken].getType() !== Token.Type.IDENT) {
            // Todo: 添加异常列表
        }
        const ident = this.tokens[this.currentToken].getValue();
        this.advance();

        // 3. 参数 '(' Params ')'
        if (this.tokens[this.currentToken].getType() !== Token.Type.LPAREN) {
            // Todo: 添加异常列表
        }
        this.advance();

        const params = this.params();

        if (this.tokens[this.currentToken].getType() !== Token.Type.RPAREN) {
            // Todo: 添加异常列表
        }
        this.advance();

        // 4. 函数的执行体 ExeUnit
        const unit = this.exeUnit();

        // 5. 构建结点
        pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());

        const funNode = new FuncObjNode(params, unit, pos);

        return new DefNode(ident, funNode, pos);
    }
    public varDef(): Node | null {
        while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }

        // 1. 关键字 'var'
        if (!this.tokens[this.currentToken].match(Token.Type.KEYWORD, "var")) { return null; }
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());
        this.advance();

        // 2. 标识符 IDENT
        if (this.tokens[this.currentToken].getType() !== Token.Type.IDENT) {
            // Todo: 添加异常列表
        }
        const ident = this.tokens[this.currentToken].getValue();
        this.advance();

        // 3. 等于号 '='
        if (this.tokens[this.currentToken].getType() !== Token.Type.EQ) {
            // Todo: 添加异常列表
        }
        this.advance();

        // 4. 表达式
        const expr = this.expr();

        pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());

        return new DefNode(ident, expr, pos);
    }
    public expr(): Node {
        let expr: Node | null = null;

        expr = this.listExpr();
        if (expr) {
            return expr;
        }

        expr = this.compExpr();
        if (expr) {
            return expr;
        }
        // Todo: 添加异常列表
        throw new Error('expr error');
    }
    public exprArray(): Node[] {
        const list: Node[] = [];
        while (true) {
            const expr = this.expr();
            // Todo: 保证expr !== null
            list.push(expr);
            if (this.tokens[this.currentToken].getType() === Token.Type.COMMA) {
                this.advance();
            } else {
                break;
            }
        }
        return list;
    }
    public ignoreEL() {
        while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
    }
    public advanceAndEL() {
        do {
            this.advance();
        } while (this.tokens[this.currentToken].getType() === Token.Type.EL);
    }
    public params() {
        const params: string[] = [];

        while (true) {
            if (this.tokens[this.currentToken].getType() === Token.Type.EL) {
                this.advance();
                continue;
            }

            if (this.tokens[this.currentToken].getType() !== Token.Type.IDENT) { break; }

            params.push(this.tokens[this.currentToken].getValue());
            this.advance();

            if (this.tokens[this.currentToken].getType() === Token.Type.COMMA) {
                this.advance();
                continue;
            }
            else {
                break;
            }
        }

        return params;
    }
    public listExpr(): Node | null {
        while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

        // 1. 左方括号 '['
        if (this.tokens[this.currentToken].getType() !== Token.Type.LBRACKET) { return null; }
        this.advance();
        while (this.tokens[this.currentToken].getType() === Token.Type.EL) { this.advance(); }

        // 2. ExprArray
        let arr: Node[] = [];
        if (this.tokens[this.currentToken].getType() !== Token.Type.RBRACKET) {
            arr = this.exprArray();
        }

        // 3. 右方括号 ']'
        this.ignoreEL();
        if (this.tokens[this.currentToken].getType() !== Token.Type.RBRACKET) {
            //Todo: 添加报错列表
        }
        this.advance();

        pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());
        return new ListObjNode(arr, pos);
    }
    public compExpr(): Node | null {
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

        let left = this.arithExpr();

        let oper = this.tokens[this.currentToken];
        while (oper.getType() === Token.Type.NE ||
            oper.getType() === Token.Type.EE ||
            oper.getType() === Token.Type.GT ||
            oper.getType() === Token.Type.LT ||
            oper.getType() === Token.Type.GTE ||
            oper.getType() === Token.Type.LTE) {
            this.advance();

            const right = this.arithExpr();
            // Todo: 保证 right !== null

            pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());

            left = new BinOperNode(oper, left, right, pos);
            oper = this.tokens[this.currentToken];
        }

        return left;
    }
    public arithExpr(): Node {
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

        let left = this.term();

        while (this.tokens[this.currentToken].getType() === Token.Type.PLUS ||
            this.tokens[this.currentToken].getType() === Token.Type.MINUS) {
            const oper = this.tokens[this.currentToken];
            this.advance();

            const right = this.term();
            // Todo: 保证 right != null

            pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());

            left = new BinOperNode(oper, left, right, pos);
        }

        return left;
    }

    public term(): Node {
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

        let left = this.factor();
        // Todo: 保证 left != null

        while (this.tokens[this.currentToken].getType() === Token.Type.MUL ||
            this.tokens[this.currentToken].getType() === Token.Type.DIV) {
            const oper = this.tokens[this.currentToken];
            this.advance();

            const right = this.factor();

            pos.setEnd(this.tokens[this.currentToken].thisPosition().getEnd());

            left = new BinOperNode(oper, left, right, pos);
        }

        return left;
    }

    public factor(): Node {
        const pos = new Position();
        pos.setStart(this.tokens[this.currentToken].thisPosition().getStart());

        const oper = this.tokens[this.currentToken].getType();
        switch (oper) {
            case Token.Type.PLUS: {
                const resOpt = this.postfixExpr();
                if (!resOpt) {
                    // Todo: 保证不存在此情况
                    throw Error('resOpt cannot be null');
                }
                return resOpt; // hdgtodo: 增加对单目运算符的支持
            }
            case Token.Type.MINUS: {
                const resOpt = this.postfixExpr();
                if (!resOpt) {
                    // Todo: 保证不存在此情况
                    throw Error('resOpt cannot be null');
                }
                return resOpt; // hdgtodo: 增加对单目运算符的支持
            }
            default: {
                const resOpt = this.postfixExpr();
                if (!resOpt) {
                    // Todo: 保证不存在此情况
                    throw Error('resOpt cannot be null');
                }
                return resOpt; // hdgtodo: 增加对单目运算符的支持
            }
        }
    }
}
