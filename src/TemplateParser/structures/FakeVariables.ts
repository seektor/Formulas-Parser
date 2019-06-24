export type FakeVariableNames = 'NUMBER_5' | 'STRING_ABC' | 'STRING_PATH' | 'ARR';

type FakeVariables = {
    [key in FakeVariableNames]: unknown
}

const values: FakeVariables = {
    NUMBER_5: 5,
    STRING_ABC: 'ABC',
    STRING_PATH: './@param',
    ARR: [1, 2, 3]
}

export default values;