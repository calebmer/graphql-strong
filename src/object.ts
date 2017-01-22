import { GraphQLNonNull, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLFieldConfigArgumentMap, GraphQLSchema, graphql, ExecutionResult } from 'graphql'
import { StrongGraphQLOutputType, StrongGraphQLInputType } from './type'
import { trimDescriptionsInConfig } from './description'

/**
 * Creates a strong GraphQL object type with a fluent builder interface.
 *
 * The type will be non-null, in order to get the nullable variant of the type
 * just call `.nullable()`.
 */
export function createObjectType <TValue>(config: StrongGraphQLObjectTypeConfig<TValue, {}>): StrongGraphQLObjectType<TValue, {}>
export function createObjectType <TValue, TContext>(config: StrongGraphQLObjectTypeConfig<TValue, TContext>): StrongGraphQLObjectType<TValue, TContext>
export function createObjectType <TValue, TContext>(config: StrongGraphQLObjectTypeConfig<TValue, TContext>): StrongGraphQLObjectType<TValue, TContext> {
  return new StrongGraphQLObjectType(new StrongGraphQLNullableObjectType(trimDescriptionsInConfig(config), []))
}

/**
 * A configuration object to be used when creating object types. Any extra
 * options will go straight into the type config.
 */
export type StrongGraphQLObjectTypeConfig<TValue, TContext> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly isTypeOf?: (value: any, context: TContext) => value is TValue,
}

/**
 * The object returned by `createObjectType`. It is non-null, to get the
 * nullable variant just call `.nullable()`.
 */
// Developers could just instantiate this object directly instead of using
// `createObjectType`, but the function interface feels nicer and allows us to
// add extra features like function overloading.
export
class StrongGraphQLObjectType<TValue, TContext>
extends GraphQLNonNull<StrongGraphQLNullableObjectType<TValue, TContext>>
implements StrongGraphQLOutputType<TValue> {
  // The required type flags.
  readonly _strongType: true = true
  readonly _strongOutputType: true = true
  readonly _strongValue = null

  /**
   * A schema created for executing queries against where the query type is this
   * object type.
   */
  private _schema: GraphQLSchema | null = null

  /**
   * The name of our object type.
   */
  public readonly name: string

  constructor (nullableType: StrongGraphQLNullableObjectType<TValue, TContext>) {
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
  public field <TFieldValue>(config: StrongGraphQLFieldConfigWithoutArgs<TValue, TContext, TFieldValue | null | undefined>): StrongGraphQLObjectType<TValue, TContext>
  public field <TFieldValue, TArgs>(config: StrongGraphQLFieldConfigWithArgs<TValue, TArgs, TContext, TFieldValue | null | undefined>): StrongGraphQLObjectType<TValue, TContext>
  public field <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, TContext, TFieldValue | null | undefined>): StrongGraphQLObjectType<TValue, TContext> {
    return new StrongGraphQLObjectType(this.ofType._field(config))
  }

  /**
   * Returns a new strong GraphQL object type with a new field. This function
   * does not mutate the type it was called on.
   */
  public fieldNonNull <TFieldValue>(config: StrongGraphQLFieldConfigWithoutArgs<TValue, TContext, TFieldValue>): StrongGraphQLObjectType<TValue, TContext>
  public fieldNonNull <TFieldValue, TArgs>(config: StrongGraphQLFieldConfigWithArgs<TValue, TArgs, TContext, TFieldValue>): StrongGraphQLObjectType<TValue, TContext>
  public fieldNonNull <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, TContext, TFieldValue>): StrongGraphQLObjectType<TValue, TContext> {
    return new StrongGraphQLObjectType(this.ofType._fieldNonNull(config))
  }

  /**
   * Extends the object type be calling a function which takes the object as an
   * input and returns an object of the same type. This allows the creation of
   * simple extensions that leverage the immutable builder pattern used by this
   * library.
   */
  public extend (extension: (type: this) => this): this {
    return extension(this)
  }

  /**
   * Returns the inner nullable version of this type without mutating anything.
   */
  public nullable (): StrongGraphQLOutputType<TValue | null | undefined> {
    return this.ofType
  }

  /**
   * Creates a new copy of this type. It is the exact same as the type which
   * `.clone()` was called on except that the reference is different.
   */
  public clone (): StrongGraphQLObjectType<TValue, TContext> {
    return new StrongGraphQLObjectType(this.ofType.clone())
  }

  /**
   * Executes a GraphQL query against this type. The schema used for executing
   * this query uses this object type as the query object type. There is no
   * mutation or subscription type.
   *
   * This can be very useful in testing.
   */
  public execute (query: string, value: TValue, context: TContext, variables: { [key: string]: any } = {}, operation?: string): Promise<ExecutionResult> {
    if (this._schema == null)
      this._schema = new GraphQLSchema({ query: this.ofType })

    return graphql(this._schema, query, value, context, variables, operation)
  }
}

/**
 * The private nullable implementation of `StrongGraphQLObjectType`. Because we
 * want types to be non-null by default, but in GraphQL types are nullable by
 * default this type is also the one that actually extends from
 * `GraphQLObjectType`.
 */
export
class StrongGraphQLNullableObjectType<TValue, TContext>
extends GraphQLObjectType
implements StrongGraphQLOutputType<TValue | null | undefined> {
  // The required type flags.
  readonly _strongType: true = true
  readonly _strongOutputType: true = true
  readonly _strongValue = null

  private readonly _strongConfig: StrongGraphQLObjectTypeConfig<TValue, TContext>
  private readonly _strongFieldConfigs: Array<StrongGraphQLFieldConfig<TValue, {}, TContext, any>>

  constructor (
    config: StrongGraphQLObjectTypeConfig<TValue, TContext>,
    fieldConfigs: Array<StrongGraphQLFieldConfig<TValue, {}, TContext, any>>,
  ) {
    super({
      name: config.name,
      description: config.description,
      isTypeOf: config.isTypeOf,

      // We define a thunk which computes our fields from the fields config
      // array we’ve built.
      fields: (): GraphQLFieldConfigMap<TValue, TContext> => {
        const fields: GraphQLFieldConfigMap<TValue, TContext> = {}

        for (const fieldConfig of fieldConfigs) {
          // Create an args object that we will give to our field config. This
          // arguments object will be mutated later and filled with argument
          // configs.
          const argsDefinition: GraphQLFieldConfigArgumentMap = {}

          fields[fieldConfig.name] = {
            description: fieldConfig.description,
            deprecationReason: fieldConfig.deprecationReason,
            type: typeof fieldConfig.type === 'function' ? fieldConfig.type().getWeakOutputType() : fieldConfig.type.getWeakOutputType(),
            args: argsDefinition,
            resolve: (source, args, context) => fieldConfig.resolve(source, args, context),
          }

          // If the field has defined some arguments, loop through the arguments
          // that exist and add them to the `args` object.
          if (fieldConfig.args) {
            for (const argName in fieldConfig.args) {
              if (fieldConfig.args.hasOwnProperty(argName)) {
                const argConfig = (fieldConfig.args as { [key: string]: StrongGraphQLArgConfig<{}> })[argName]

                argsDefinition[argName] = {
                  type: argConfig.type.getWeakInputType(),
                  defaultValue: argConfig.defaultValue,
                  description: argConfig.description,
                }
              }
            }
          }
        }

        return fields
      },
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
  public _field <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, TContext, TFieldValue | null | undefined>): StrongGraphQLNullableObjectType<TValue, TContext> {
    this._assertUniqueFieldName(config.name)
    return new StrongGraphQLNullableObjectType(this._strongConfig, [...this._strongFieldConfigs, trimDescriptionsInConfig({
      ...config,
      type: () => typeof config.type === 'function' ? config.type().nullable() : config.type.nullable(),
    })])
  }

  /**
   * This field is a private implementation detail and should not be used
   * outside of `StrongGraphQLObjectType`!
   */
  public _fieldNonNull <TFieldValue, TArgs>(config: StrongGraphQLFieldConfig<TValue, TArgs, TContext, TFieldValue>): StrongGraphQLNullableObjectType<TValue, TContext> {
    this._assertUniqueFieldName(config.name)
    return new StrongGraphQLNullableObjectType(this._strongConfig, [...this._strongFieldConfigs, trimDescriptionsInConfig(config)])
  }

  /**
   * Returns self.
   */
  public nullable (): this {
    return this
  }

  /**
   * Creates a new copy of this type. It is the exact same as the type which
   * `.clone()` was called on except that the reference is different.
   */
  public clone (): StrongGraphQLNullableObjectType<TValue, TContext> {
    return new StrongGraphQLNullableObjectType(this._strongConfig, this._strongFieldConfigs)
  }
}

/**
 * A type which represents the GraphQL type definition of the argument
 * TypeScript type provided.
 */
export type StrongGraphQLArgsConfig<TArgs> = {
  [TArg in keyof TArgs]: StrongGraphQLArgConfig<TArgs[TArg]>
}

/**
 * A type which represents a single argument configuration.
 */
export type StrongGraphQLArgConfig<TValue> = {
  readonly type: StrongGraphQLInputType<TValue>,
  readonly defaultValue?: TValue,
  readonly description?: string | undefined,
}

/**
 * The configration object for a single field of a strong GraphQL object type.
 * Takes a lot of generic type parameters to make sure everything is super safe!
 *
 * Arguments are optional.
 */
export type StrongGraphQLFieldConfig<TSourceValue, TArgs, TContext, TValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly deprecationReason?: string | undefined,
  readonly type: StrongGraphQLOutputType<TValue> | (() => StrongGraphQLOutputType<TValue>),
  readonly args?: StrongGraphQLArgsConfig<TArgs>,
  readonly resolve: (source: TSourceValue, args: TArgs, context: TContext) => TValue | Promise<TValue>,
}

/**
 * A single field configuration except for you don’t need the arguments.
 */
export type StrongGraphQLFieldConfigWithoutArgs<TSourceValue, TContext, TValue> = StrongGraphQLFieldConfig<TSourceValue, {}, TContext, TValue>

/**
 * A single field configuration except the arguments are required.
 */
export type StrongGraphQLFieldConfigWithArgs<TSourceValue, TArgs, TContext, TValue> = StrongGraphQLFieldConfig<TSourceValue, TArgs, TContext, TValue> & {
  readonly args: StrongGraphQLArgsConfig<TArgs>,
}
