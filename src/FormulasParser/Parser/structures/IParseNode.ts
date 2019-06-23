import { ParseNodeType } from "./ParseNodeType";

export interface IParseNode {
    value: string;
    type: ParseNodeType;
    columnFrom: number;
    columnTo: number;
    children: IParseNode[];
}