import { TemplateParser } from "../TemplateParser/TemplateParser";

class App {

    private testString: string = '`${IF(LENGTH(GET("STRING_PATH")), GET("STRING_ABC"), IF(5 > 2, 5, 2))}`';

    constructor() {
        const templateParser: TemplateParser = new TemplateParser();
        templateParser.process(this.testString);
    }
}

const app = new App();

export { app };

