import { ValueNode, GraphQLNonNull, GraphQLScalarType } from 'graphql'
import { StrongGraphQLOutputType, StrongGraphQLInputOutputType } from './type'
import { trimDescriptionsInConfig } from './description'

/**
 * Creates a GraphQL scalar type.
 *
 * If you just past a `serialize` function with your config you will get an
 * output type. If you pass both a `parseValue` and `parseLiteral` function with
 * your config, you will get an input/output type.
 */
export function createScalarType <TInternalValue, TExternalValue>(config: StrongGraphQLScalarTypeConfigWithoutInput<TInternalValue, TExternalValue>): StrongGraphQLOutputType<TInternalValue>
export function createScalarType <TInternalValue, TExternalValue>(config: StrongGraphQLScalarTypeConfigWithInput<TInternalValue, TExternalValue>): StrongGraphQLInputOutputType<TInternalValue>
export function createScalarType <TInternalValue, TExternalValue>(config: StrongGraphQLScalarTypeConfig<TInternalValue, TExternalValue>): StrongGraphQLInputOutputType<TInternalValue> {
  return new StrongGraphQLScalarType(new StrongGraphQLNullableScalarType(trimDescriptionsInConfig(config)))
}

/**
 * The base GraphQL scalar type config. It has optional `parseValue` and
 * `parseLiteral` properties.
 */
type StrongGraphQLScalarTypeConfig<TInternalValue, TExternalValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly serialize: (value: TInternalValue) => TExternalValue,
  readonly parseValue?: (value: TExternalValue) => TInternalValue | null,
  readonly parseLiteral?: (ast: ValueNode) => TInternalValue | null,
}

/**
 * A GraphQL scalar type config that does not support input values, only output
 * values.
 */
export type StrongGraphQLScalarTypeConfigWithoutInput<TInternalValue, TExternalValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly serialize: (value: TInternalValue) => TExternalValue,
}

/**
 * A GraphQL scalar type config that does support input values alongside output
 * values.
 */
export type StrongGraphQLScalarTypeConfigWithInput<TInternalValue, TExternalValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly serialize: (value: TInternalValue) => TExternalValue,
  readonly parseValue: (value: TExternalValue) => TInternalValue | null,
  readonly parseLiteral: (ast: ValueNode) => TInternalValue | null,
}

/**
 * The non-null strong GraphQL scalar type object.
 */
class StrongGraphQLScalarType<TInternalValue, TExternalValue>
extends GraphQLNonNull<StrongGraphQLNullableScalarType<TInternalValue, TExternalValue>>
implements StrongGraphQLInputOutputType<TInternalValue> {
  // The required type flags.
  readonly _strongType = true
  readonly _strongInputType = true
  readonly _strongOutputType = true
  readonly _strongValue = null

  constructor (nullableType: StrongGraphQLNullableScalarType<TInternalValue, TExternalValue>) {
    super(nullableType)
  }

  // The required type conversion methods.
  public _weakType (): this { return this }
  public _weakInputType (): this { return this }
  public _weakOutputType (): this { return this }

  /**
   * Returns the inner nullable variation of this type.
   */
  public nullable (): StrongGraphQLInputOutputType<TInternalValue | null | undefined> {
    return this.ofType
  }
}

/**
 * The nullable sstrong GraphQL scalar type object.
 */
class StrongGraphQLNullableScalarType<TInternalValue, TExternalValue>
extends GraphQLScalarType
implements StrongGraphQLInputOutputType<TInternalValue | null | undefined> {
  // The required type flags.
  readonly _strongType = true
  readonly _strongInputType = true
  readonly _strongOutputType = true
  readonly _strongValue = null

  constructor (config: StrongGraphQLScalarTypeConfig<TInternalValue, TExternalValue>) {
    super(config)
  }

  // The required type conversion methods.
  public _weakType (): this { return this }
  public _weakInputType (): this { return this }
  public _weakOutputType (): this { return this }

  /**
   * Returns self.
   */
  public nullable (): this {
    return this
  }
}
