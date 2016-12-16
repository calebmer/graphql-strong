import { StrongGraphQLInputType, StrongGraphQLOutputType, createScalarType } from '../../index'

// Works for just output types
{
  const type = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
  })
}

// Cannot have `parseValue` without `parseLiteral`
{
  const type = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
    parseValue: value => String(value),
  })
}

// Cannot have `parseLiteral` without `parseValue`
{
  const type = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
    parseLiteral: value => value.kind,
  })
}

// Will not let an output type be an input type
{
  const type1: StrongGraphQLOutputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
  })

  const type2: StrongGraphQLInputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
  })
}

// Will let an input-output type be both an input and output type
{
  const type1: StrongGraphQLOutputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
    parseValue: value => String(value),
    parseLiteral: value => value.kind,
  })

  const type2: StrongGraphQLInputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value),
    parseValue: value => String(value),
    parseLiteral: value => value.kind,
  })
}
