# Formulas-Parser

A simple formulas parser that can be used for example during json config processing. A value to evaluate has to be provided inside `${...}` symbol. The value string can contains multiple formulas.
Expressions like "`Equals: ${GET('VAR_1')}`" or "`${GET('VAR_1')} ${GET('VAR_1')}`" evaluates always to string, like a string template in js.
Single formulas like "`${GET('VAR_1')}`" evaluates to the value underneath.

# Available functions

## `GET(arg)`

Returns the value from the argument provided.

### Return type:
* **ANY**

### Params:
* **STRING** *arg* Source value path

### Example:
`"Two plus Two equals ${GET('VAR_1')}"`

`"${GET('VAR_1')}"`

## `LENGTH(arg)`

Returns the length of the value underneath the GET arg.

### Return type:
* **NUMBER**

### Params:
* **GET** *arg* GET function invocation.

### Example:
`"${LENGTH( GET('VAR_1') )}"`

## `IF(condition, onTrue, onFalse)`

Returns either the onTrue or onFalse depending on the condition. 

### Return type:
* **ANY**

### Params:
* **VALUE EXPRESSION | BINARY EXPRESSION** *condition* Condition which evaluates to true or false. Can be a single [ValueExpression](#valueExpressions) which leads to classic js truthy/falsy value evaluation or a [BinaryExpression](#binaryExpressions) 
* **VALUE EXPRESSION** *onTrue*
* **VALUE EXPRESSION** *onFalse*

### Example:
`"${IF(LENGTH( GET('VAR_1') ) >= 5, 'More', 'Less')}"`

# BinaryExpressions
Supported comparators:
- `===`
- `>`
- `>=`
- `<`
- `<=`

# ValueExpressions
- `'Abc'` - String literal
- `5` - Number literal
- `IF`
- `GET`
- `LENGTH`
- `true`
- `false`