import { KeywordTokenType } from "./KeywordTokenType";
import { MapLike } from "./MapLike";
import { TokenType } from "./TokenType";

export const textToKeyword: MapLike<KeywordTokenType> = {
    IF: TokenType.IfKeyword,
    GET: TokenType.GetKeyword,
    LENGTH: TokenType.LengthKeyword,
    true: TokenType.TrueKeyword,
    false: TokenType.FalseKeyword,
}