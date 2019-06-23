export enum ParseNodeType {
    SourceFile = "SourceFile",
    TemplateString = "TemplateString",
    GetCall = "GetCall",
    LengthCall = "LengthCall",
    EqualityOperator = "EqualityOperator",
    GreaterThanToken = "GreaterThanToken",
    GreaterThanEqualsToken = "GreaterThanEqualsToken",
    LessThanToken = "LessThanToken",
    LessThanEqualsToken = "LessThanEqualsToken",
    StringLiteral = "StringLiteral",
    NumericLiteral = "NumericLiteral",
    EndOfFileToken = "EndOfFileToken",
    Formula = "Formula",
    BinaryExpression = "BinaryExpression",
    IfKeyword = "IfKeyword"
}