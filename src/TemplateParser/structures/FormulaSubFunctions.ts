import FakeVariable from '../structures/FakeVariables';
import { SubFunctionName } from "../Transpiler/structures/SubFunctionName";
import { FakeVariableNames } from "./FakeVariables";

const getFunction: Function = (identifier: FakeVariableNames): unknown => {
    switch (identifier) {
        case "NUMBER_5":
            return FakeVariable.NUMBER_5;
        case "STRING_ABC":
            return FakeVariable.STRING_ABC;
        case "STRING_PATH":
            return FakeVariable.STRING_PATH;
        case "ARR":
            return FakeVariable.ARR;
        default:
            return "Undefined Variable"
    }
};

const lengthFunction: Function = (argument: string | unknown[]): number => (argument || []).length;

export type IFormulaSubFunctions = Map<SubFunctionName, Function>;

export default new Map([
    [SubFunctionName.Get, getFunction],
    [SubFunctionName.Length, lengthFunction]
])