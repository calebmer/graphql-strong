import { GraphQLNonNull, GraphQLEnumType } from 'graphql';
import { StrongGraphQLInputOutputType } from './type';
import { trimDescriptionsInConfig } from './description';

/**
 * Creates a type-safe non-null enum GraphQL type.
 */
export function createEnumType <TValue>(config: StrongGraphQLEnumTypeConfig<TValue>): StrongGraphQLInputOutputType<TValue> {
  return new StrongGraphQLEnumType<TValue>(new StrongGraphQLNullableEnumType<TValue>(trimDescriptionsInConfig(config)));
}

/**
 * The configuration for an enum type.
 */
export type StrongGraphQLEnumTypeConfig<TValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly values: {
    readonly [valueName: string]: {
      readonly value: TValue,
      readonly description?: string | undefined,
      readonly deprecationReason?: string | undefined,
    },
  },
};

/**
 * The non-null strong GraphQL enum type object.
 */
class StrongGraphQLEnumType<TValue>
extends GraphQLNonNull<StrongGraphQLNullableEnumType<TValue>>
implements StrongGraphQLInputOutputType<TValue> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongInputType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TValue = undefined as any;

  constructor(nullableType: StrongGraphQLNullableEnumType<TValue>) {
    super(nullableType);
  }

  // The required type conversion methods.
  public getWeakType(): this { return this; }
  public getWeakInputType(): this { return this; }
  public getWeakOutputType(): this { return this; }

  /**
   * Returns the inner nullable variation of this type.
   */
  public nullable(): StrongGraphQLInputOutputType<TValue | null | undefined> {
    return this.ofType;
  }
}

/**
 * The nullable sstrong GraphQL enum type object.
 */
class StrongGraphQLNullableEnumType<TValue>
extends GraphQLEnumType
implements StrongGraphQLInputOutputType<TValue | null | undefined> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongInputType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TValue | null | undefined = undefined as any;

  constructor(config: StrongGraphQLEnumTypeConfig<TValue>) {
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
