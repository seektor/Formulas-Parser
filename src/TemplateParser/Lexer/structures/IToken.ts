import { TokenType } from "./TokenType";

export interface IToken {
    lexeme: string;
    type: TokenType;
    columnFrom: number;
    columnTo: number;
}