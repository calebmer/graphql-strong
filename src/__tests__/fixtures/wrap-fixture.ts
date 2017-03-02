import { GraphQLInputType, GraphQLOutputType, GraphQLInputObjectType, GraphQLObjectType, GraphQLEnumType } from 'graphql';
import { StrongInputType, StrongOutputType, wrapWeakType } from '../../index';

const anyType: any = null;

// Input type will not wrap to output type 1
{
  const type = wrapWeakType<{}>(anyType as GraphQLInputType);
  const input: StrongInputType<{}> = type;
  const output: StrongOutputType<{}> = type;
}

// Input type will not wrap to output type 2
{
  const type = wrapWeakType<{}>(anyType as GraphQLInputObjectType);
  const input: StrongInputType<{}> = type;
  const output: StrongOutputType<{}> = type;
}

// Output type will not wrap to input type 1
{
  const type = wrapWeakType<{}>(anyType as GraphQLOutputType);
  const input: StrongInputType<{}> = type;
  const output: StrongOutputType<{}> = type;
}

// Output type will not wrap to input type 2
{
  const type = wrapWeakType<{}>(anyType as GraphQLObjectType);
  const input: StrongInputType<{}> = type;
  const output: StrongOutputType<{}> = type;
}

// Input/output types will wrap to both input and outputs 1
{
  const type = wrapWeakType<{}>(anyType as (GraphQLInputType & GraphQLOutputType));
  const input: StrongInputType<{}> = type;
  const output: StrongOutputType<{}> = type;
}

// Input/output types will wrap to both input and outputs 2
{
  const type = wrapWeakType<{}>(anyType as GraphQLEnumType);
  const input: StrongInputType<{}> = type;
  const output: StrongOutputType<{}> = type;
}
