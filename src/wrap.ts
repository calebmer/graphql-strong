import { GraphQLType, GraphQLInputType, GraphQLOutputType, GraphQLNonNull, GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean, GraphQLID, assertInputType, assertOutputType } from 'graphql';
import { StrongInputType, StrongOutputType, StrongInputOutputType } from './type';

// Wrappings for types that are baked into the standard library.
export const IntegerType = wrapWeakType<number>(GraphQLInt);
export const FloatType = wrapWeakType<number>(GraphQLFloat);
export const StringType = wrapWeakType<string>(GraphQLString);
export const BooleanType = wrapWeakType<boolean>(GraphQLBoolean);
export const IDType = wrapWeakType<string>(GraphQLID);

/**
 * Wraps a `GraphQLType` into a strong GraphQL type with an associated type in
 * the type system. If the `GraphQLType` is a `GraphQLInputType` a
 * `StrongInputType` will be returned, if the `GraphQLType` is a
 * `GraphQLOutputType` a `StrongOutputType` will be returned, and if the
 * `GraphQLType` is both a `GraphQLInputType` and a `GraphQLOutputType` a
 * `StrongInputOutputType` will be returned.
 */
export function wrapWeakType <TValue>(type: GraphQLInputType & GraphQLOutputType): StrongInputOutputType<TValue>;
export function wrapWeakType <TValue>(type: GraphQLInputType): StrongInputType<TValue>;
export function wrapWeakType <TValue>(type: GraphQLOutputType): StrongOutputType<TValue>;
export function wrapWeakType <TValue>(type: GraphQLType): StrongInputOutputType<TValue> {
  const nullableStrongType: StrongInputOutputType<TValue | null | undefined> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: undefined as any,
    getWeakType: () => type,
    getWeakInputType: () => assertInputType(type),
    getWeakOutputType: () => assertOutputType(type),
    nullable: () => nullableStrongType,
  };
  const strongType: StrongInputOutputType<TValue> = {
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
