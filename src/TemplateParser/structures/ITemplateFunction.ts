import { IFormulaSubFunctions } from "./FormulaSubFunctions";

export interface ITemplateFunction {
    (availableFunctions: IFormulaSubFunctions): string;
}