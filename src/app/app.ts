import { Lexer } from "../FormulasParser/Lexer/Lexer";
import { IToken } from "../FormulasParser/Lexer/structures/IToken";
import { Parser } from "../FormulasParser/Parser/Parser";
import { IParseNode } from "../FormulasParser/Parser/structures/IParseNode";

class App {

    private testString: string = '`${IF(LENGTH(GET("./path/@param")) >= 10, "More", "Less")}`';

    constructor() {
        const lexer: Lexer = new Lexer();
        const tokens: IToken[] = lexer.process(this.testString);
        console.log(tokens);

        const parser: Parser = new Parser();
        const ast: IParseNode = parser.process(this.testString, tokens);
        console.log(ast);

    }
}

const app = new App();

export { app };

