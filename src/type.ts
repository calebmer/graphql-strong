import { GraphQLType, GraphQLInputType, GraphQLOutputType } from 'graphql'

/**
 * A strong GraphQL type which when composed with other strong GraphQL types
 * makes a system that is language type-safe.
 *
 * Most of the time, types will also inherit from `StrongGraphQLInputType` or
 * `StrongGraphQLOutputType`.
 */
export interface StrongGraphQLType<TValue> {
  /**
   * Serves as a flag to simulate nominal types. Otherwise a `StrongGraphQLType`
   * would be equal to any other type given TypeScript’s structural approach to
   * typing.
   *
   * This is a private field and may be changed or removed at any time.
   */
  readonly _strongType: true

  /**
   * Serves as a flag in the type system so that two different
   * `StrongGraphQLType`’s with different `TValue`s won’t be considered as the
   * same thing by TypeScript’s structural type system.
   *
   * This value will always be null, it is useless outside of the type system,
   * private, and may be changed or removed at any time.
   */
  readonly _strongValue: TValue | null

  /**
   * Gets the vanilla GraphQL-JS type for this strong type. Many types will
   * just return themselves as they extend a GraphQL type.
   */
  getWeakType (): GraphQLType

  /**
   * Gets a nullable variation of this type since types are non-null by default.
   * If this type is already nullable, the type may return itself.
   */
  nullable (): StrongGraphQLType<TValue | null | undefined>
}

/**
 * A GraphQL input type. Input types may be used anywhere in GraphQL to receive
 * data.
 */
export interface StrongGraphQLInputType<TValue> extends StrongGraphQLType<TValue> {
  /**
   * A flag that marks these objects as an input type. We never use this outside
   * of the type system. It is private and may be removed at any time.
   */
  readonly _strongInputType: true

  /**
   * Gets the vanilla GraphQL-JS input type for this strong type. Many types
   * will just return themselves as they extend a GraphQL type.
   */
  getWeakInputType (): GraphQLInputType

  /**
   * Gets a nullable variation of this type since types are non-null by default.
   * If this type is already nullable, the type may return itself.
   */
  nullable (): StrongGraphQLInputType<TValue | null | undefined>
}

/**
 * A GraphQL output type. Output types are used whenever you are outputting data
 * from the API.
 */
export interface StrongGraphQLOutputType<TValue> extends StrongGraphQLType<TValue> {
  /**
   * A flag that marks these objects as an input type. We never use this outside
   * of the type system. It is private and may be removed at any time.
   */
  readonly _strongOutputType: true

  /**
   * Gets the vanilla GraphQL-JS output type for this strong type. Many types
   * will just return themselves as they extend a GraphQL type.
   */
  getWeakOutputType (): GraphQLOutputType

  /**
   * Gets a nullable variation of this type since types are non-null by default.
   * If this type is already nullable, the type may return itself.
   */
  nullable (): StrongGraphQLOutputType<TValue | null | undefined>
}

/**
 * A convenience interface that merges both `StrongGraphQLInputType` and
 * `StrongGraphQLOutputType`.
 */
export interface StrongGraphQLInputOutputType<TValue> extends StrongGraphQLType<TValue>, StrongGraphQLInputType<TValue>, StrongGraphQLOutputType<TValue> {
  /**
   * Gets a nullable variation of this type since types are non-null by default.
   * If this type is already nullable, the type may return itself.
   */
  nullable (): StrongGraphQLInputOutputType<TValue | null | undefined>
}
