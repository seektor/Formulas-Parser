import { Lexer } from "../FormulasParser/Lexer/Lexer";
import { IToken } from "../FormulasParser/Lexer/structures/IToken";

class App {

    private testString: string = '``';

    constructor() {
        const lexer: Lexer = new Lexer();
        const tokens: IToken[] = lexer.process(this.testString);
        console.log(tokens);
    }
}

const app = new App();

export { app };

