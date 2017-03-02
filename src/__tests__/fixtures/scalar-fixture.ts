import { StrongGraphQLInputType, StrongGraphQLOutputType, createScalarType } from '../../index';

// Works for just output types
{
  const type = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
  });
}

// Cannot have `parseValue` without `parseLiteral`
{
  const type = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
    parseValue: value => String(value),
  });
}

// Cannot have `parseLiteral` without `parseValue`
{
  const type = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
    parseLiteral: value => value.kind,
  });
}

// Will not let an output type be an input type
{
  const type1: StrongGraphQLOutputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
  });

  const type2: StrongGraphQLInputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
  });
}

// Will let an input-output type be both an input and output type
{
  const type1: StrongGraphQLOutputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
    parseValue: value => String(value),
    parseLiteral: value => value.kind,
  });

  const type2: StrongGraphQLInputType<string> = createScalarType<string, number>({
    name: 'foo',
    serialize: value => parseInt(value, 10),
    parseValue: value => String(value),
    parseLiteral: value => value.kind,
  });
}
