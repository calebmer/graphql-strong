import { StrongType, StrongInputType, StrongOutputType, StrongInputOutputType } from './type';

/**
 * Returns a type which has the same type as the strong GraphQL type passed in,
 * except the type also supports null values.
 *
 * In the standard GraphQL-JS library, all types are nullable by default.
 * However, in TypeScript and many other type systems it makes more sense that
 * types be non-null by default. This is like `GraphQLNonNull` except it does
 * the inverse.
 */
export function createNullableType<TValue>(type: StrongInputOutputType<TValue>): StrongInputOutputType<TValue | null | undefined>;
export function createNullableType<TValue>(type: StrongInputType<TValue>): StrongInputType<TValue | null | undefined>;
export function createNullableType<TValue>(type: StrongOutputType<TValue>): StrongOutputType<TValue | null | undefined>;
export function createNullableType<TValue>(type: StrongType<TValue>): StrongType<TValue | null | undefined> {
  return type.nullable();
}
