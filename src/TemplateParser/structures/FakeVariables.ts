export type FakeVariableNames = 'NUMBER_5' | 'STRING_ABC' | 'STRING_PATH';

type FakeVariables = {
    [key in FakeVariableNames]: unknown
}

const values: FakeVariables = {
    NUMBER_5: 5,
    STRING_ABC: 'ABC',
    STRING_PATH: './@param'
}

export default values;