import { Lexer } from "./Lexer/Lexer";
import { IToken } from "./Lexer/structures/IToken";
import { Parser } from "./Parser/Parser";
import { IParseNode } from "./Parser/structures/IParseNode";
import FormulaSubFunctions from "./structures/FormulaSubFunctions";
import { ITranspiledTemplate } from "./Structures/ITranspiledTemplate";
import { Transpiler } from "./Transpiler/Transpiler";

export class TemplateParser {

    private lexer: Lexer;
    private parser: Parser;
    private transpiler: Transpiler;

    constructor() {
        this.lexer = new Lexer();
        this.parser = new Parser();
        this.transpiler = new Transpiler();
    }

    public process(template: string): Function {
        const tokens: IToken[] = this.lexer.process(template);
        console.log('Tokens: ', tokens);

        console.log('=== === ===');

        const ast: IParseNode = this.parser.process(template, tokens);
        console.log('ParseNodes: ', ast);

        console.log('=== === ===');

        const transpiledTemplate: ITranspiledTemplate = this.transpiler.process(ast);
        console.log('Template function: ', transpiledTemplate);
        console.log('Result: ', transpiledTemplate.func(FormulaSubFunctions));

        return () => { }
    }
}