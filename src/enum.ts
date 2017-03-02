import { GraphQLNonNull, GraphQLEnumType } from 'graphql';
import { StrongInputOutputType } from './type';
import { trimDescriptionsInConfig } from './description';

/**
 * Creates a type-safe non-null enum GraphQL type.
 */
export function createEnumType <TValue>(config: StrongEnumTypeConfig<TValue>): StrongInputOutputType<TValue> {
  return new StrongEnumType<TValue>(new StrongNullableEnumType<TValue>(trimDescriptionsInConfig(config)));
}

/**
 * The configuration for an enum type.
 */
export type StrongEnumTypeConfig<TValue> = {
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
class StrongEnumType<TValue>
extends GraphQLNonNull<StrongNullableEnumType<TValue>>
implements StrongInputOutputType<TValue> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongInputType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TValue = undefined as any;

  constructor(nullableType: StrongNullableEnumType<TValue>) {
    super(nullableType);
  }

  // The required type conversion methods.
  public getWeakType(): this { return this; }
  public getWeakInputType(): this { return this; }
  public getWeakOutputType(): this { return this; }

  /**
   * Returns the inner nullable variation of this type.
   */
  public nullable(): StrongInputOutputType<TValue | null | undefined> {
    return this.ofType;
  }
}

/**
 * The nullable sstrong GraphQL enum type object.
 */
class StrongNullableEnumType<TValue>
extends GraphQLEnumType
implements StrongInputOutputType<TValue | null | undefined> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongInputType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TValue | null | undefined = undefined as any;

  constructor(config: StrongEnumTypeConfig<TValue>) {
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
