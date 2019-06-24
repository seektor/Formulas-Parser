import { ITemplateFunction } from "./ITemplateFunction";

export interface ITranspiledTemplate {
    func: ITemplateFunction,
    variableNames: string[];
}