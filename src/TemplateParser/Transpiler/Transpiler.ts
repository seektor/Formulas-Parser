import { IParseNode } from '../Parser/structures/IParseNode';
import { ParseNodeType } from '../Parser/structures/ParseNodeType';
import { ITemplateFunction } from '../structures/ITemplateFunction';
import { ITranspiledTemplate } from '../structures/ITranspiledTemplate';
import { SubFunctionName } from './structures/SubFunctionName';

export class Transpiler {

    private readonly subFunctionsArgName: string = 'subFunctions';
    private variableNames: string[];

    constructor() { }

    public process(parseNode: IParseNode): ITranspiledTemplate {
        const templateStringNode: IParseNode = parseNode.children[0];
        if (templateStringNode.type !== ParseNodeType.TemplateString) {
            return {
                func: () => '',
                variableNames: []
            };
        }
        this.variableNames = [];
        const functionBody: string = this.buildFunctionBody(templateStringNode);
        const func: ITemplateFunction = new Function(this.subFunctionsArgName, functionBody) as ITemplateFunction;
        return {
            func,
            variableNames: this.variableNames
        };
    }

    private buildFunctionBody(parseNode: IParseNode): string {
        const pretranspiledNodes: IParseNode[] = parseNode.children;
        let value: unknown;
        if (pretranspiledNodes.length === 1) {
            value = this.resolveNode(pretranspiledNodes[0]);
        } else {
            const valueBody: string = parseNode.children.reduce((result: string, node: IParseNode) => {
                return result += `\${${this.resolveNode(node).toString()}}`;
            }, '');
            value = `\`${valueBody}\``;
        }
        return `return ${value};`;
    }

    private resolveNode(parseNode: IParseNode): string {
        switch (parseNode.type) {
            case ParseNodeType.TemplateLiteral:
                return this.resolveTemplateLiteral(parseNode);
            case ParseNodeType.StringLiteral:
                return this.resolveStringLiteral(parseNode);
            case ParseNodeType.NumericLiteral:
                return this.resolveNumericLiteral(parseNode);
            case ParseNodeType.Formula:
                return this.resolveNode(parseNode.children[0]);
            case ParseNodeType.GetCall:
                return this.resolveGetCall(parseNode);
            case ParseNodeType.LengthCall:
                return this.resolveLengthCall(parseNode);
            case ParseNodeType.IfKeyword:
                return this.resolveIfKeyword(parseNode);
            case ParseNodeType.TrueKeyword:
            case ParseNodeType.FalseKeyword:
                return this.resolveBooleanKeyword(parseNode);
            default:
                throw new Error('Invalid parseNode type!');
        }
    }

    private resolveLengthCall(parseNode: IParseNode): string {
        return `${this.subFunctionsArgName}.${SubFunctionName.Length}(${this.resolveNode(parseNode.children[0])})`;
    }

    private resolveGetCall(parseNode: IParseNode): string {
        const [variableNode] = parseNode.children;
        this.variableNames.push(variableNode.value.slice(1, -1));
        return `${this.subFunctionsArgName}.${SubFunctionName.Get}(${variableNode.value})`;
    }

    private resolveNumericLiteral(parseNode: IParseNode): string {
        return parseNode.value;
    }

    private resolveStringLiteral(parseNode: IParseNode): string {
        return parseNode.value;
    }

    private resolveTemplateLiteral(parseNode: IParseNode): string {
        return `"${parseNode.value}"`;
    }

    private resolveIfKeyword(parseNode: IParseNode): string {
        const [condition, onTrue, onFalse] = parseNode.children;
        return `${this.resolveIfCondition(condition)} ? ${this.resolveNode(onTrue)} : ${this.resolveNode(onFalse)}`;
    }

    private resolveIfCondition(parseNode: IParseNode): string {
        if (parseNode.type === ParseNodeType.BinaryExpression) {
            return this.resolveBinaryExpression(parseNode);
        } else {
            return this.resolveNode(parseNode);
        }
    }

    private resolveBooleanKeyword(parseNode: IParseNode): string {
        return parseNode.type === ParseNodeType.TrueKeyword ? 'true' : 'false';
    }

    private resolveBinaryExpression(parseNode: IParseNode): string {
        const [firstArg, comparator, secondArg] = parseNode.children;
        return `${this.resolveNode(firstArg)} ${this.resolveStringLiteral(comparator)} ${this.resolveNode(secondArg)}`;
    }
}