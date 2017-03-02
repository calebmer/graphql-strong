import { GraphQLType, GraphQLInputType, GraphQLOutputType, GraphQLNonNull, GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean, GraphQLID, assertInputType, assertOutputType } from 'graphql';
import { StrongGraphQLInputType, StrongGraphQLOutputType, StrongGraphQLInputOutputType } from './type';

// Wrappings for types that are baked into the standard library.
export const IntegerType = wrapWeakType<number>(GraphQLInt);
export const FloatType = wrapWeakType<number>(GraphQLFloat);
export const StringType = wrapWeakType<string>(GraphQLString);
export const BooleanType = wrapWeakType<boolean>(GraphQLBoolean);
export const IDType = wrapWeakType<string>(GraphQLID);

/**
 * Wraps a `GraphQLType` into a strong GraphQL type with an associated type in
 * the type system. If the `GraphQLType` is a `GraphQLInputType` a
 * `StrongGraphQLInputType` will be returned, if the `GraphQLType` is a
 * `GraphQLOutputType` a `StrongGraphQLOutputType` will be returned, and if the
 * `GraphQLType` is both a `GraphQLInputType` and a `GraphQLOutputType` a
 * `StrongGraphQLInputOutputType` will be returned.
 */
export function wrapWeakType <TValue>(type: GraphQLInputType & GraphQLOutputType): StrongGraphQLInputOutputType<TValue>;
export function wrapWeakType <TValue>(type: GraphQLInputType): StrongGraphQLInputType<TValue>;
export function wrapWeakType <TValue>(type: GraphQLOutputType): StrongGraphQLOutputType<TValue>;
export function wrapWeakType <TValue>(type: GraphQLType): StrongGraphQLInputOutputType<TValue> {
  const nullableStrongType: StrongGraphQLInputOutputType<TValue | null | undefined> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: undefined as any,
    getWeakType: () => type,
    getWeakInputType: () => assertInputType(type),
    getWeakOutputType: () => assertOutputType(type),
    nullable: () => nullableStrongType,
  };
  const strongType: StrongGraphQLInputOutputType<TValue> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: undefined as any,
    getWeakType: () => new GraphQLNonNull(type),
    getWeakInputType: () => new GraphQLNonNull(assertInputType(type)),
    getWeakOutputType: () => new GraphQLNonNull(assertOutputType(type)),
    nullable: () => nullableStrongType,
  };
  return strongType;
}
