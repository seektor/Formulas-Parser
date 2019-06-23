import { CharacterCodes } from "./structures/CharacterCodes";
import { IToken } from "./structures/IToken";
import { KeywordTokenType } from "./structures/KeywordTokenType";
import { textToKeyword } from "./structures/TextToKeyword";
import { TokenType } from "./structures/TokenType";

export class Lexer {

    private text: string;
    private startPosition: number;
    private textEndPosition: number;
    private currentPosition: number;
    private isInsideFormula: boolean;

    private bactickTranslation: number = 1;

    constructor() {

    }

    public process(template: string): IToken[] {
        if (template.charCodeAt(0) !== CharacterCodes.backtick || template.charCodeAt(template.length - 1) !== CharacterCodes.backtick) {
            return [];
        };
        this.text = template.slice(1, -1);
        this.currentPosition = 0;
        this.isInsideFormula = false;
        const tokens: IToken[] = [];

        this.textEndPosition = this.text.length;
        while (true) {
            const tokenType: TokenType = this.scan();
            tokens.push({
                columnFrom: this.startPosition + this.bactickTranslation,
                columnTo: this.currentPosition + this.bactickTranslation,
                lexeme: this.text.substring(this.startPosition, this.currentPosition),
                type: tokenType
            })
            if (tokenType === TokenType.EndOfFileToken) {
                break;
            }
        }

        return tokens;
    }

    private scan(): TokenType {
        this.startPosition = this.currentPosition;
        while (true) {
            if (this.currentPosition >= this.textEndPosition) {
                return TokenType.EndOfFileToken;
            }

            if (!this.isInsideFormula) {
                return this.scanStringUntilFormula();
            }

            const char: CharacterCodes = this.text.charCodeAt(this.currentPosition);

            switch (char) {
                case CharacterCodes.space:
                    while (this.text.charCodeAt(this.currentPosition + 1) === CharacterCodes.space) {
                        this.currentPosition++;
                    }
                    this.currentPosition++;
                    return TokenType.Whitespace;
                case CharacterCodes.doubleQuote:
                case CharacterCodes.singleQuote:
                    return this.scanString();
                case CharacterCodes.$:
                    if (this.text.charCodeAt(this.currentPosition + 1) === CharacterCodes.openBrace) {
                        this.currentPosition += 2;
                        this.isInsideFormula = true;
                        return TokenType.DollarBraceToken;
                    }
                case CharacterCodes.closeBrace:
                    this.isInsideFormula = false;
                    this.currentPosition++;
                    return TokenType.CloseBraceToken;
                case CharacterCodes.openParen:
                    this.currentPosition++;
                    return TokenType.OpenParenthesisToken;
                case CharacterCodes.closeParen:
                    this.currentPosition++;
                    return TokenType.CloseParenthesisToken;
                case CharacterCodes.comma:
                    this.currentPosition++;
                    return TokenType.CommaToken;
                case CharacterCodes.lessThan:
                    if (this.text.charCodeAt(this.currentPosition + 1) === CharacterCodes.equals) {
                        this.currentPosition += 2;
                        return TokenType.LessThanEqualsToken;
                    } else {
                        this.currentPosition++;
                        return TokenType.LessThanToken;
                    }
                case CharacterCodes.equals:
                    if (this.isValidEqualsOperator()) {
                        this.currentPosition += 3;
                        return TokenType.EqualityOperator;
                    } else {
                        this.error('Invalid equality operator!');
                    }
                case CharacterCodes.greaterThan:
                    if (this.text.charCodeAt(this.currentPosition + 1) === CharacterCodes.equals) {
                        this.currentPosition += 2;
                        return TokenType.GreaterThanEqualsToken;
                    } else {
                        this.currentPosition++;
                        return TokenType.GreaterThanToken;
                    }
                case CharacterCodes._1:
                case CharacterCodes._2:
                case CharacterCodes._3:
                case CharacterCodes._4:
                case CharacterCodes._5:
                case CharacterCodes._6:
                case CharacterCodes._7:
                case CharacterCodes._8:
                case CharacterCodes._9:
                    return this.scanNumber();
                default:
                    if (this.isIdentifierStart(char)) {
                        this.currentPosition++;
                        while (this.currentPosition < this.textEndPosition && this.isIdentifierPart(this.text.charCodeAt(this.currentPosition))) {
                            this.currentPosition++;
                        }
                        return this.getIdentifierToken();
                    }
                    this.error('Invalid character!');
                    this.currentPosition++;
                    return TokenType.Unknown;
            }
        }
    }

    private scanNumber(): TokenType.NumericLiteral {
        const mainFragment: string = this.scanNumberFragment();
        let decimalFragment: string | undefined;
        if (this.text.charCodeAt(this.currentPosition) === CharacterCodes.dot) {
            this.currentPosition++;
            decimalFragment = this.scanNumberFragment();
        }
        return TokenType.NumericLiteral;
    }

    private scanNumberFragment(): string {
        const start: number = this.currentPosition;
        while (true) {
            const char: CharacterCodes = this.text.charCodeAt(this.currentPosition);
            if (!this.isDigit(char)) {
                break;
            }
            this.currentPosition++;
        }
        return this.text.substring(start, this.currentPosition);
    }

    private scanStringUntilFormula(): TokenType.StringLiteral {
        while (true) {
            if (this.currentPosition >= this.textEndPosition) {
                return TokenType.StringLiteral;
            }
            if (this.text.charCodeAt(this.currentPosition) === CharacterCodes.$ && this.text.charCodeAt(this.currentPosition + 1) === CharacterCodes.openBrace) {
                this.isInsideFormula = true;
                return TokenType.StringLiteral;
            }
            this.currentPosition++;
        }
    }

    private scanString(): TokenType.StringLiteral {
        const quoteCharacter: CharacterCodes = this.text.charCodeAt(this.currentPosition);
        this.currentPosition++;
        while (true) {
            if (this.currentPosition >= this.textEndPosition) {
                return TokenType.StringLiteral;
            }
            const character: CharacterCodes = this.text.charCodeAt(this.currentPosition);
            if (character === quoteCharacter) {
                this.currentPosition++;
                return TokenType.StringLiteral;
            }
            this.currentPosition++;
        }
    }

    private getIdentifierToken(): KeywordTokenType | TokenType.Identifier {
        let keywordLiteral: string = this.text.slice(this.startPosition, this.currentPosition);
        const keyword: KeywordTokenType | undefined = textToKeyword[keywordLiteral];
        if (keyword) {
            return textToKeyword[keywordLiteral];
        }
        return TokenType.Identifier;
    }

    private isIdentifierStart(char: number): boolean {
        return char >= CharacterCodes.A && char <= CharacterCodes.Z || char >= CharacterCodes.a && char <= CharacterCodes.z;
    }

    private isIdentifierPart(char: number): boolean {
        return char >= CharacterCodes.A && char <= CharacterCodes.Z || char >= CharacterCodes.a && char <= CharacterCodes.z;
    }

    private isDigit(char: number): boolean {
        return char >= CharacterCodes._0 && char <= CharacterCodes._9;
    }

    private isValidEqualsOperator(): boolean {
        if (this.text.charCodeAt(this.currentPosition + 1) === CharacterCodes.equals) {
            if (this.text.charCodeAt(this.currentPosition + 2) === CharacterCodes.equals) {
                return true;
            }
        }
        return false;
    }

    private error(msg: string): void {
        throw new Error(`Lexer error! ${msg} '${this.text[this.currentPosition]}' At line ${this.currentPosition + this.bactickTranslation}.`);
    }
}