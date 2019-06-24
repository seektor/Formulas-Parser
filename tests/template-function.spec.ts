import { expect } from 'chai';
import 'mocha';
import FakeVariables, { FakeVariableNames } from '../src/TemplateParser/structures/FakeVariables';
import FormulaSubFunctions, { IFormulaSubFunctions } from '../src/TemplateParser/structures/FormulaSubFunctions';
import { ITranspiledTemplate } from '../src/TemplateParser/Structures/ITranspiledTemplate';
import { TemplateParser } from '../src/TemplateParser/TemplateParser';

describe('Template function', () => {
    const templateParser: TemplateParser = new TemplateParser();
    const availableSubFunctions: IFormulaSubFunctions = FormulaSubFunctions;

    it('should return empty string when empty string is provided', () => {
        const template: string = '``';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('');
    })

    it('should return string, without formula', () => {
        const template: string = '`ABC 123`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('ABC 123');
    })

    it('should return string when string with surrounding spaces is provided, without formula', () => {
        const template: string = '`  ABC `';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('  ABC ');
    })

    it('should return numberString provided to formula', () => {
        const template: string = '`${123}`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('123');
    })

    it('should return string when string in single quotes is provided to formula', () => {
        const template: string = "`${'ABC'}`";
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('ABC');
    })

    it('should return string when string in double quotes is provided to formula', () => {
        const template: string = '`${"ABC"}`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('ABC');
    })

    it('should return string in double quotes provided to formula', () => {
        const template: string = '`${"ABC"}`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('ABC');
    })

    it('should throw an error when multiple arguments are provided to formula', () => {
        const template: string = '`${"ABC" 123}`';
        expect(() => templateParser.process(template)).to.throw();
    })

    it('should GET proper value from argument in double quotes', () => {
        const variableName: FakeVariableNames = "STRING_ABC";
        const template: string = '`${GET("STRING_ABC")}`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal(FakeVariables.STRING_ABC);
    })

    it('should GET proper value from argument in single quotes', () => {
        const variableName: FakeVariableNames = "STRING_PATH";
        const template: string = "`${GET('STRING_PATH')}`";
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal(FakeVariables.STRING_PATH);
    })

    it('should ignore empty spaces on function call', () => {
        const variableName: FakeVariableNames = "STRING_PATH";
        const template: string = "`${  GET('STRING_PATH'   )}`";
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal(FakeVariables.STRING_PATH);
    })

    it('should return valid string length', () => {
        const variableName: FakeVariableNames = "STRING_ABC";
        const template: string = '`${LENGTH(GET("STRING_ABC"))}`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('3');
    })

    it('should return valid array length', () => {
        const variableName: FakeVariableNames = "ARR";
        const template: string = '`${LENGTH(GET("ARR"))}`';
        const transpiledTemplate: ITranspiledTemplate = templateParser.process(template);
        const result: string = transpiledTemplate.func(availableSubFunctions);
        expect(result).to.equal('3');
    })

    // TODO: Continue with IF tests

})