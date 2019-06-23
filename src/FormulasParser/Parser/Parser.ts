import { IToken } from "../Lexer/structures/IToken";
import { TokenType } from "../Lexer/structures/TokenType";
import { IParseNode as IParseNode } from "./structures/IParseNode";
import { ParseNodeType } from "./structures/ParseNodeType";

export class Parser {

    private tokens: IToken[];
    private text: string;
    private currentIndex: number;
    private lastIndex: number;

    constructor() {

    }

    public process(template: string, tokens: IToken[]): IParseNode {
        this.text = template;
        this.tokens = tokens.filter((token: IToken) => token.type !== TokenType.Whitespace);
        this.currentIndex = 0;
        this.lastIndex = this.tokens.length - 1;
        const ast: IParseNode = this.parseSourceFile();
        if (this.currentIndex < this.lastIndex) {
            this.error('Not all tokens have been parsed!?', 0);
        }
        return ast;
    }

    private parseSourceFile(): IParseNode {
        const endOfFileToken: IToken = this.tokens[this.tokens.length - 1];
        if (endOfFileToken.type !== TokenType.EndOfFileToken) {
            this.error('Missing end of file token!', 0);
        }
        const parsedNodes: IParseNode[] = [];
        if (this.tokens.length <= 1) {
            parsedNodes.push(this.parseEndOfFileToken());
        } else {
            parsedNodes.push(this.parseTemplateToken());
            parsedNodes.push(this.parseEndOfFileToken());
            if (this.currentIndex !== this.lastIndex + 1) {
                this.error('Not all tokens have been parsed!?', 0);
            }
        }
        return {
            columnFrom: 0,
            columnTo: endOfFileToken.columnTo,
            type: ParseNodeType.SourceFile,
            value: this.text.slice(this.tokens[0].columnFrom, endOfFileToken.columnTo),
            children: parsedNodes
        }
    }

    private parseTemplateToken(): IParseNode {
        const parsedNodes: IParseNode[] = [];
        while (true) {
            if (this.currentIndex >= this.lastIndex) {
                break;
            }
            const currentToken: IToken = this.tokens[this.currentIndex];
            switch (currentToken.type) {
                case TokenType.StringLiteral:
                    parsedNodes.push(this.parseStringLiteralToken());
                    break;
                case TokenType.DollarBraceToken:
                    parsedNodes.push(this.parseFormula());
                    break;
                default:
                    this.error(`Unexpected source token - ${currentToken.type}!`, currentToken.columnFrom);
                    return;
            }
        }
        const lastTemplateToken: IToken = this.tokens[this.tokens.length - 2];
        return {
            columnFrom: 0,
            columnTo: lastTemplateToken.columnTo,
            type: ParseNodeType.TemplateString,
            value: this.text.slice(this.tokens[0].columnFrom, lastTemplateToken.columnTo),
            children: parsedNodes
        };
    }

    private parseEndOfFileToken(): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        this.currentIndex++;
        return {
            children: [],
            columnFrom: token.columnFrom,
            columnTo: token.columnTo,
            type: ParseNodeType.EndOfFileToken,
            value: ''
        }
    }

    private parseFormula(): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        const formulaStartTokenIndex: number = this.currentIndex;
        const formulaEndTokenIndex: number | null = this.findTokenIndexFrom(TokenType.CloseBraceToken, formulaStartTokenIndex);
        if (formulaEndTokenIndex === null) {
            this.error(`Missing formula's close brace!`, token.columnFrom);
        }
        const formulaEndToken: IToken = this.tokens[formulaEndTokenIndex];
        this.currentIndex++;
        const formulaNode: IParseNode = {
            children: this.parseFormulaBody(formulaEndTokenIndex),
            columnFrom: token.columnFrom,
            columnTo: formulaEndToken.columnTo,
            type: ParseNodeType.Formula,
            value: this.text.slice(token.columnFrom, formulaEndToken.columnTo)
        }
        this.currentIndex = formulaEndTokenIndex + 1;
        return formulaNode;
    }

    private parseFormulaBody(toTokenIndex: number): IParseNode[] {
        const parsedNodes: IParseNode[] = [];
        while (true) {
            if (this.currentIndex >= toTokenIndex) {
                break;
            }
            const currentToken: IToken = this.tokens[this.currentIndex];
            switch (currentToken.type) {
                case TokenType.StringLiteral:
                    parsedNodes.push(this.parseStringLiteralToken());
                    break;
                case TokenType.NumericLiteral:
                    parsedNodes.push(this.parseNumericLiteralToken());
                    break;
                case TokenType.GetKeyword:
                    parsedNodes.push(this.parseGetKeyword());
                    break;
                case TokenType.LengthKeyword:
                    parsedNodes.push(this.parseLengthKeyword());
                    break;
                case TokenType.IfKeyword:
                    parsedNodes.push(this.parseIfKeyword());
                    break;
                default:
                    this.error(`Unexpected formula body token value - '${currentToken.lexeme}'!`, currentToken.columnFrom);
                    break;
            }
        }
        if (parsedNodes.length > 1) {
            this.error('Formula cannot accept more than 1 argument!', parsedNodes[1].columnFrom);
        }
        return parsedNodes;
    }

    private parseIfKeyword(): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        const openParenToken: IToken | undefined = this.tokens[this.currentIndex + 1];
        this.currentIndex++;
        const closingParenTokenIndex: number | null = this.findClosingToken(TokenType.CloseParenthesisToken, this.currentIndex + 1, TokenType.OpenParenthesisToken);
        if ((openParenToken && openParenToken.type !== TokenType.OpenParenthesisToken) || closingParenTokenIndex === null) {
            this.error('Invalid IF parentheses!', openParenToken.columnFrom);
        }

    }

    private parseGetKeyword(): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        const openParenToken: IToken | undefined = this.tokens[this.currentIndex + 1];
        const argumentToken: IToken = this.tokens[this.currentIndex + 2];
        const closeParenToken: IToken | undefined = this.tokens[this.currentIndex + 3];
        if ((openParenToken && openParenToken.type !== TokenType.OpenParenthesisToken)
            || (closeParenToken && closeParenToken.type !== TokenType.CloseParenthesisToken)) {
            this.error('Invalid GET parentheses!', openParenToken.columnFrom);
        }
        if (argumentToken.type !== TokenType.StringLiteral) {
            this.error('Get argument should be of string type', argumentToken.columnFrom);
        }
        this.currentIndex += 2;
        const argument: IParseNode = this.parseStringLiteralToken();
        this.currentIndex++;
        return {
            children: [argument],
            columnFrom: token.columnFrom,
            columnTo: closeParenToken.columnTo,
            type: ParseNodeType.GetCall,
            value: this.text.slice(token.columnFrom, closeParenToken.columnTo)
        }
    }

    private parseLengthKeyword(): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        const openParenToken: IToken | undefined = this.tokens[this.currentIndex + 1];
        const argumentToken: IToken | undefined = this.tokens[this.currentIndex + 2];
        if (argumentToken && argumentToken.type !== TokenType.GetKeyword) {
            this.error('Length function has to take a GET function argument!', argumentToken.columnFrom);
        }
        this.currentIndex += 2;
        const argument: IParseNode = this.parseGetKeyword();
        const closeParenToken: IToken | undefined = this.tokens[this.currentIndex];
        if ((openParenToken && openParenToken.type !== TokenType.OpenParenthesisToken)
            || (closeParenToken && closeParenToken.type !== TokenType.CloseParenthesisToken)) {
            this.error('Wrong LENGTH parentheses!', openParenToken.columnFrom);
        }
        this.currentIndex++;
        return {
            children: [argument],
            columnFrom: token.columnFrom,
            columnTo: closeParenToken.columnTo,
            type: ParseNodeType.LengthCall,
            value: this.text.slice(token.columnFrom, closeParenToken.columnTo)
        }
    }

    private parseStringLiteralToken(stripQuotes?: boolean): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        this.currentIndex++;
        const value: string = stripQuotes ? this.text.slice(token.columnFrom + 1, token.columnTo - 1) : this.text.slice(token.columnFrom, token.columnTo);
        return {
            children: [],
            columnFrom: token.columnFrom,
            columnTo: token.columnTo,
            type: ParseNodeType.StringLiteral,
            value: value
        }
    }

    private parseNumericLiteralToken(): IParseNode {
        const token: IToken = this.tokens[this.currentIndex];
        this.currentIndex++;
        return {
            children: [],
            columnFrom: token.columnFrom,
            columnTo: token.columnTo,
            type: ParseNodeType.NumericLiteral,
            value: token.lexeme
        }
    }

    private findTokenIndexFrom(tokenType: TokenType, fromIndex: number): number | null {
        let index: number = null;
        for (let i = fromIndex; i < this.tokens.length; i++) {
            if (this.tokens[i].type === tokenType) {
                index = i;
                break;
            }
        }
        return index;
    }

    private findClosingToken(closingToken: TokenType, fromIndex: number, openingToken: TokenType): number | null {
        let index: number = null;
        let openingTokensCount: number = 0;
        for (let i = fromIndex; i < this.tokens.length; i++) {
            const token: IToken = this.tokens[i];
            if (token.type === TokenType.CloseParenthesisToken) {
                if (openingTokensCount === 0) {
                    index = i;
                    break;
                }
                openingTokensCount--;
            }
            if (token.type === TokenType.OpenParenthesisToken) {
                openingTokensCount++;
            }
        }
        return index;
    }

    private isFunctionKeyword(tokenType: TokenType): boolean {
        return tokenType === TokenType.LengthKeyword || tokenType === TokenType.GetKeyword;
    }

    private error(msg: string, lineNumber: number): void {
        throw new Error(`Parser Error! ${msg} At line ${lineNumber}.`);
    }
}