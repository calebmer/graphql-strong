import { GraphQLInterfaceType, GraphQLNonNull } from 'graphql'
import { StrongGraphQLOutputType } from './type'
import { StrongGraphQLObjectType, StrongGraphQLFieldConfig, StrongGraphQLFieldConfigWithArgs, createWeakFieldMap } from './object'
import { trimDescriptionsInConfig } from './description'

/**
 * Creates the basis for a strong GraphQL interface type. To add fields just
 * call `field` and `fieldNonNull`.
 *
 * The type when used will be non-null. In order to get the nullable variant of
 * the type just call `.nullable()`.
 */
export function createInterfaceType <TValue>(config: StrongGraphQLInterfaceTypeConfig<TValue>): StrongGraphQLInterfaceType<TValue> {
  return new StrongGraphQLInterfaceType(new StrongGraphQLNullableInterfaceType(trimDescriptionsInConfig(config), []))
}

/**
 * The configuration object type for creating interface types.
 */
export type StrongGraphQLInterfaceTypeConfig<TValue> = {
  readonly name: string
  readonly description?: string | undefined
  readonly resolveType?: (value: TValue) => StrongGraphQLObjectType<TValue, any>
}

/**
 * The type returned by `createInterfaceType`. It is non-null, to get the
 * nullable variant just call `.nullable()`.
 */
export
class StrongGraphQLInterfaceType<TValue>
extends GraphQLNonNull<StrongGraphQLNullableInterfaceType<TValue>>
implements StrongGraphQLOutputType<TValue> {
  // The required type flags.
  readonly _strongType: true
  readonly _strongOutputType: true
  readonly _strongValue: TValue | null

  /**
   * The name of our interface type.
   */
  public readonly name: string

  constructor (nullableType: StrongGraphQLNullableInterfaceType<TValue>) {
    super(nullableType)
    this.name = nullableType.name
  }

  // The required type conversion methods.
  public getWeakType (): this { return this }
  public getWeakOutputType (): this { return this }

  /**
   * Returns a new strong GraphQL object type with a new field. This function
   * does not mutate the type it was called on.
   *
   * The field created will have a nullable type. To get a non-null field type
   * use `fieldNonNull`.
   */
  public field <TFieldValue>(config: StrongGraphQLFieldConfig<TValue, {}, never, TFieldValue | null | undefined>): StrongGraphQLInterfaceType<TValue>
  public field <TFieldValue, TArgs>(config: StrongGraphQLFieldConfigWithArgs<TValue, TArgs, never, TFieldValue | null | undefined>): StrongGraphQLInterfaceType<TValue>
  public field <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, never, TFieldValue | null | undefined>): StrongGraphQLInterfaceType<TValue> {
    return new StrongGraphQLInterfaceType(this.ofType._field(config))
  }

  /**
   * Returns a new strong GraphQL object type with a new field. This function
   * does not mutate the type it was called on.
   */
  public fieldNonNull <TFieldValue>(config: StrongGraphQLFieldConfig<TValue, {}, never, TFieldValue>): StrongGraphQLInterfaceType<TValue>
  public fieldNonNull <TFieldValue, TArgs>(config: StrongGraphQLFieldConfigWithArgs<TValue, TArgs, never, TFieldValue>): StrongGraphQLInterfaceType<TValue>
  public fieldNonNull <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, never, TFieldValue>): StrongGraphQLInterfaceType<TValue> {
    return new StrongGraphQLInterfaceType(this.ofType._fieldNonNull(config))
  }

  /**
   * Returns the inner nullable version of this type without mutating anything.
   */
  public nullable (): StrongGraphQLOutputType<TValue | null | undefined> {
    return this.ofType
  }
}

/**
 * The nullable variant of the interface type that gets wrapped by the public
 * non-null variant. Because of the way strong GraphQL works this is the object
 * that actually extends `GraphQLInterfaceType`.
 */
export
class StrongGraphQLNullableInterfaceType<TValue>
extends GraphQLInterfaceType
implements StrongGraphQLOutputType<TValue> {
  // The required type flags.
  readonly _strongType: true
  readonly _strongOutputType: true
  readonly _strongValue: TValue | null

  private readonly _strongConfig: StrongGraphQLInterfaceTypeConfig<TValue>
  private readonly _strongFieldConfigs: Array<StrongGraphQLFieldConfig<TValue, {}, never, any>>

  constructor (
    config: StrongGraphQLInterfaceTypeConfig<TValue>,
    fieldConfigs: Array<StrongGraphQLFieldConfig<TValue, {}, never, any>>,
  ) {
    const { resolveType } = config
    super({
      name: config.name,
      description: config.description,
      resolveType: resolveType && (value => resolveType(value).ofType),
      fields: () => createWeakFieldMap(fieldConfigs),
    })
    this._strongConfig = config
    this._strongFieldConfigs = fieldConfigs
  }

  // The required type conversion methods.
  public getWeakType (): this { return this }
  public getWeakOutputType (): this { return this }

  /**
   * Returns true if we already have a field of this name.
   */
  private _hasField (fieldName: string): boolean {
    return Boolean(this._strongFieldConfigs.find(({ name }) => name === fieldName))
  }

  /**
   * Throws an error if we already have a field with the provided name,
   * otherwise the function does nothing.
   */
  private _assertUniqueFieldName (fieldName: string): void {
    if (this._hasField(fieldName))
      throw new Error(`Type '${this.name}' already has a field named '${fieldName}'.`)
  }

  /**
   * This field is a private implementation detail and should not be used
   * outside of `StrongGraphQLObjectType`!
   */
  public _field <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, never, TFieldValue | null | undefined>): StrongGraphQLNullableInterfaceType<TValue> {
    this._assertUniqueFieldName(config.name)

    if (config.resolve)
      throw new Error(`Field '${config.resolve}' has a resolver, but it will never be used.`)

    return new StrongGraphQLNullableInterfaceType(this._strongConfig, [...this._strongFieldConfigs, trimDescriptionsInConfig({
      ...config,
      type: () => typeof config.type === 'function' ? config.type().nullable() : config.type.nullable(),
    })])
  }

  /**
   * This field is a private implementation detail and should not be used
   * outside of `StrongGraphQLObjectType`!
   */
  public _fieldNonNull <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, never, TFieldValue>): StrongGraphQLNullableInterfaceType<TValue> {
    this._assertUniqueFieldName(config.name)

    if (config.resolve)
      throw new Error(`Field '${config.resolve}' has a resolver, but it will never be used.`)

    return new StrongGraphQLNullableInterfaceType(this._strongConfig, [...this._strongFieldConfigs, trimDescriptionsInConfig(config)])
  }

  /**
   * Returns self.
   */
  public nullable (): this {
    return this
  }
}
