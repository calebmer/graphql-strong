import { StrongGraphQLType, StrongGraphQLInputType, StrongGraphQLOutputType, StrongGraphQLInputOutputType } from './type'

/**
 * Returns a type which has the same type as the strong GraphQL type passed in,
 * except the type also supports null values.
 *
 * In the standard GraphQL-JS library, all types are nullable by default.
 * However, in TypeScript and many other type systems it makes more sense that
 * types be non-null by default. This is like `GraphQLNonNull` except it does
 * the inverse.
 */
export function createNullableType <TValue>(type: StrongGraphQLInputOutputType<TValue>): StrongGraphQLInputOutputType<TValue | null | undefined>
export function createNullableType <TValue>(type: StrongGraphQLInputType<TValue>): StrongGraphQLInputType<TValue | null | undefined>
export function createNullableType <TValue>(type: StrongGraphQLOutputType<TValue>): StrongGraphQLOutputType<TValue | null | undefined>
export function createNullableType <TValue>(type: StrongGraphQLType<TValue>): StrongGraphQLType<TValue | null | undefined> {
  return type.nullable()
}
