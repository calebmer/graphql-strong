import { ValueNode, GraphQLNonNull, GraphQLScalarType } from 'graphql';
import { StrongOutputType, StrongInputOutputType } from './type';
import { trimDescriptionsInConfig } from './description';

/**
 * Creates a GraphQL scalar type.
 *
 * If you just past a `serialize` function with your config you will get an
 * output type. If you pass both a `parseValue` and `parseLiteral` function with
 * your config, you will get an input/output type.
 */
export function createScalarType<TInternalValue, TExternalValue>(config: StrongScalarTypeConfigWithoutInput<TInternalValue, TExternalValue>): StrongOutputType<TInternalValue>;
export function createScalarType<TInternalValue, TExternalValue>(config: StrongScalarTypeConfigWithInput<TInternalValue, TExternalValue>): StrongInputOutputType<TInternalValue>;
export function createScalarType<TInternalValue, TExternalValue>(config: StrongScalarTypeConfig<TInternalValue, TExternalValue>): StrongInputOutputType<TInternalValue> {
  return new StrongScalarType(new StrongNullableScalarType(trimDescriptionsInConfig(config)));
}

/**
 * The base GraphQL scalar type config. It has optional `parseValue` and
 * `parseLiteral` properties.
 */
type StrongScalarTypeConfig<TInternalValue, TExternalValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly serialize: (value: TInternalValue) => TExternalValue,
  readonly parseValue?: (value: TExternalValue) => TInternalValue | null,
  readonly parseLiteral?: (ast: ValueNode) => TInternalValue | null,
};

/**
 * A GraphQL scalar type config that does not support input values, only output
 * values.
 */
export type StrongScalarTypeConfigWithoutInput<TInternalValue, TExternalValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly serialize: (value: TInternalValue) => TExternalValue,
};

/**
 * A GraphQL scalar type config that does support input values alongside output
 * values.
 */
export type StrongScalarTypeConfigWithInput<TInternalValue, TExternalValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly serialize: (value: TInternalValue) => TExternalValue,
  readonly parseValue: (value: TExternalValue) => TInternalValue | null,
  readonly parseLiteral: (ast: ValueNode) => TInternalValue | null,
};

/**
 * The non-null strong GraphQL scalar type object.
 */
class StrongScalarType<TInternalValue, TExternalValue>
extends GraphQLNonNull<StrongNullableScalarType<TInternalValue, TExternalValue>>
implements StrongInputOutputType<TInternalValue> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongInputType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TInternalValue = undefined as any;

  constructor(nullableType: StrongNullableScalarType<TInternalValue, TExternalValue>) {
    super(nullableType);
  }

  // The required type conversion methods.
  public getWeakType(): this { return this; }
  public getWeakInputType(): this { return this; }
  public getWeakOutputType(): this { return this; }

  /**
   * Returns the inner nullable variation of this type.
   */
  public nullable(): StrongInputOutputType<TInternalValue | null | undefined> {
    return this.ofType;
  }
}

/**
 * The nullable sstrong GraphQL scalar type object.
 */
class StrongNullableScalarType<TInternalValue, TExternalValue>
extends GraphQLScalarType
implements StrongInputOutputType<TInternalValue | null | undefined> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongInputType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TInternalValue | null | undefined = undefined as any;

  constructor(config: StrongScalarTypeConfig<TInternalValue, TExternalValue>) {
    super(config);
  }

  // The required type conversion methods.
  public getWeakType(): this { return this; }
  public getWeakInputType(): this { return this; }
  public getWeakOutputType(): this { return this; }

  /**
   * Returns self.
   */
  public nullable(): this {
    return this;
  }
}
