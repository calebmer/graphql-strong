import { GraphQLNonNull, GraphQLObjectType, GraphQLFieldConfigMap, GraphQLSchema, graphql, ExecutionResult } from 'graphql';
import { StrongOutputType } from './type';
import { trimDescriptionsInConfig } from './description';
import { StrongArgsConfig, getWeakArgsMap } from './args';
import { StrongInterfaceFieldMap, StrongInterfaceType, StrongInterfaceImplementation } from './interface';

/**
 * Creates a strong GraphQL object type with a fluent builder interface.
 *
 * The type will be non-null, in order to get the nullable variant of the type
 * just call `.nullable()`.
 */
export function createObjectType<TValue>(config: StrongObjectTypeConfig<TValue, {}>): StrongObjectType<TValue, {}>;
export function createObjectType<TValue, TContext>(config: StrongObjectTypeConfig<TValue, TContext>): StrongObjectType<TValue, TContext>;
export function createObjectType<TValue, TContext>(config: StrongObjectTypeConfig<TValue, TContext>): StrongObjectType<TValue, TContext> {
  return new StrongObjectType(new StrongNullableObjectType(trimDescriptionsInConfig(config), [], []));
}

/**
 * A configuration object to be used when creating object types. Any extra
 * options will go straight into the type config.
 */
export type StrongObjectTypeConfig<TValue, TContext> = {
  readonly name: string,
  readonly description?: string | undefined,
};

/**
 * The configration object for a single field of a strong GraphQL object type.
 * Takes a lot of generic type parameters to make sure everything is super safe!
 *
 * Arguments are optional.
 */
export type StrongFieldConfig<TSourceValue, TArgs, TContext, TValue> = {
  readonly name: string,
  readonly description?: string | undefined,
  readonly deprecationReason?: string | undefined,
  readonly type: StrongOutputType<TValue> | (() => StrongOutputType<TValue>),
  readonly args?: StrongArgsConfig<TArgs>,
  readonly resolve: (source: TSourceValue, args: TArgs, context: TContext) => TValue | Promise<TValue>,
};

/**
 * A single field configuration except for you don’t need the arguments.
 */
export type StrongFieldConfigWithoutArgs<TSourceValue, TContext, TValue> = StrongFieldConfig<TSourceValue, {}, TContext, TValue>;

/**
 * A single field configuration except the arguments are required.
 */
export type StrongFieldConfigWithArgs<TSourceValue, TArgs, TContext, TValue> = StrongFieldConfig<TSourceValue, TArgs, TContext, TValue> & {
  readonly args: StrongArgsConfig<TArgs>,
};

/**
 * The object returned by `createObjectType`. It is non-null, to get the
 * nullable variant just call `.nullable()`.
 */
// Developers could just instantiate this object directly instead of using
// `createObjectType`, but the function interface feels nicer and allows us to
// add extra features like function overloading.
export
class StrongObjectType<TValue, TContext>
extends GraphQLNonNull<StrongNullableObjectType<TValue, TContext>>
implements StrongOutputType<TValue> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TValue = undefined as any;

  /**
   * A schema created for executing queries against where the query type is this
   * object type.
   */
  private _schema: GraphQLSchema | null = null;

  /**
   * The name of our object type.
   */
  public readonly name: string;

  constructor(nullableType: StrongNullableObjectType<TValue, TContext>) {
    super(nullableType);
    this.name = nullableType.name;
  }

  // The required type conversion methods.
  public getWeakType(): this { return this; }
  public getWeakOutputType(): this { return this; }

  /**
   * Returns the inner nullable version of this type without mutating anything.
   */
  public nullable(): StrongOutputType<TValue | null | undefined> {
    return this.ofType;
  }

  /**
   * Returns a new strong GraphQL object type with a new field. This function
   * does not mutate the type it was called on.
   *
   * The field created will have a nullable type. To get a non-null field type
   * use `fieldNonNull`.
   */
  public field<TFieldValue>(config: StrongFieldConfigWithoutArgs<TValue, TContext, TFieldValue | null | undefined>): StrongObjectType<TValue, TContext>
  public field<TFieldValue, TArgs>(config: StrongFieldConfigWithArgs<TValue, TArgs, TContext, TFieldValue | null | undefined>): StrongObjectType<TValue, TContext>
  public field<TFieldValue, TArgs>(config: StrongFieldConfig<TValue, TArgs, TContext, TFieldValue | null | undefined>): StrongObjectType<TValue, TContext> {
    return new StrongObjectType(this.ofType._field(config));
  }

  /**
   * Returns a new strong GraphQL object type with a new field. This function
   * does not mutate the type it was called on.
   */
  public fieldNonNull<TFieldValue>(config: StrongFieldConfigWithoutArgs<TValue, TContext, TFieldValue>): StrongObjectType<TValue, TContext>
  public fieldNonNull<TFieldValue, TArgs>(config: StrongFieldConfigWithArgs<TValue, TArgs, TContext, TFieldValue>): StrongObjectType<TValue, TContext>
  public fieldNonNull<TFieldValue, TArgs>(config: StrongFieldConfig<TValue, TArgs, TContext, TFieldValue>): StrongObjectType<TValue, TContext> {
    return new StrongObjectType(this.ofType._fieldNonNull(config));
  }

  /**
   * Implement a strong GraphQL interface defining only the new resolvers. All
   * of the descriptions, type, and argument information will be copied over
   * from the interface type.
   */
  public implement<TFieldMap extends StrongInterfaceFieldMap>(
    interfaceType: StrongInterfaceType<any, TFieldMap>,
    implementation: StrongInterfaceImplementation<TValue, TContext, TFieldMap>,
  ): StrongObjectType<TValue, TContext> {
    return new StrongObjectType(this.ofType._implement(interfaceType, implementation));
  }

  /**
   * Extends the object type be calling a function which takes the object as an
   * input and returns an object of the same type. This allows the creation of
   * simple extensions that leverage the immutable builder pattern used by this
   * library.
   */
  public extend(extension: (type: this) => StrongObjectType<TValue, TContext>): StrongObjectType<TValue, TContext> {
    return extension(this);
  }

  /**
   * Creates a new copy of this type. It is the exact same as the type which
   * `.clone()` was called on except that the reference is different.
   */
  public clone(): StrongObjectType<TValue, TContext> {
    return new StrongObjectType(this.ofType.clone());
  }

  /**
   * Executes a GraphQL query against this type. The schema used for executing
   * this query uses this object type as the query object type. There is no
   * mutation or subscription type.
   *
   * This can be very useful in testing.
   */
  public execute(query: string, value: TValue, context: TContext, variables: { [key: string]: any } = {}, operation?: string): Promise<ExecutionResult> {
    if (this._schema === null) {
      this._schema = new GraphQLSchema({ query: this.ofType });
    }
    return graphql(this._schema, query, value, context, variables, operation);
  }
}

/**
 * The private nullable implementation of `StrongObjectType`. Because we
 * want types to be non-null by default, but in GraphQL types are nullable by
 * default this type is also the one that actually extends from
 * `GraphQLObjectType`.
 */
export
class StrongNullableObjectType<TValue, TContext>
extends GraphQLObjectType
implements StrongOutputType<TValue | null | undefined> {
  // The required type flags.
  public readonly _strongType: true = true;
  public readonly _strongOutputType: true = true;
  public readonly _strongValue: TValue | null | undefined = undefined as any;

  private readonly _strongConfig: StrongObjectTypeConfig<TValue, TContext>;
  private readonly _strongInterfaces: Array<StrongInterfaceType<TValue, {}>>;
  private readonly _strongFieldConfigs: Array<StrongFieldConfig<TValue, {}, TContext, any>>;

  constructor(
    config: StrongObjectTypeConfig<TValue, TContext>,
    interfaces: Array<StrongInterfaceType<TValue, {}>>,
    fieldConfigs: Array<StrongFieldConfig<TValue, {}, TContext, any>>,
  ) {
    super({
      name: config.name,
      description: config.description,
      // Add all of the nullable versions of our interfaces.
      interfaces: interfaces.map(interfaceType => interfaceType.ofType),
      // We define a thunk which computes our fields from the fields config
      // array we’ve built.
      fields: (): GraphQLFieldConfigMap<TValue, TContext> => {
        const weakFields: GraphQLFieldConfigMap<TValue, TContext> = {};
        for (const fieldConfig of fieldConfigs) {
          weakFields[fieldConfig.name] = {
            description: fieldConfig.description,
            deprecationReason: fieldConfig.deprecationReason,
            type: typeof fieldConfig.type === 'function' ? fieldConfig.type().getWeakOutputType() : fieldConfig.type.getWeakOutputType(),
            args: fieldConfig.args && getWeakArgsMap(fieldConfig.args),
            resolve: (source, args, context) => fieldConfig.resolve(source, args, context),
          };
        }
        return weakFields;
      },
    });
    this._strongConfig = config;
    this._strongInterfaces = interfaces;
    this._strongFieldConfigs = fieldConfigs;
  }

  // The required type conversion methods.
  public getWeakType(): this { return this; }
  public getWeakOutputType(): this { return this; }

  /**
   * Returns self.
   */
  public nullable(): this {
    return this;
  }

  /**
   * Creates a new copy of this type. It is the exact same as the type which
   * `.clone()` was called on except that the reference is different.
   */
  public clone(): StrongNullableObjectType<TValue, TContext> {
    return new StrongNullableObjectType(
      this._strongConfig,
      this._strongInterfaces,
      this._strongFieldConfigs,
    );
  }

  /**
   * Returns true if we already have a field of this name.
   */
  private _hasField(fieldName: string): boolean {
    return !!this._strongFieldConfigs.find(({ name }) => name === fieldName);
  }

  /**
   * Throws an error if we already have a field with the provided name,
   * otherwise the function does nothing.
   */
  private _assertUniqueFieldName(fieldName: string): void {
    if (this._hasField(fieldName)) {
      throw new Error(`Type '${this.name}' already has a field named '${fieldName}'.`);
    }
  }

  /**
   * This method is a private implementation detail and should not be used
   * outside of `StrongObjectType`!
   */
  public _field <TFieldValue, TArgs>(config: StrongFieldConfig<TValue, TArgs, TContext, TFieldValue | null | undefined>): StrongNullableObjectType<TValue, TContext> {
    this._assertUniqueFieldName(config.name);
    return new StrongNullableObjectType(
      this._strongConfig,
      this._strongInterfaces,
      [...this._strongFieldConfigs, trimDescriptionsInConfig({
        ...config,
        type: () => typeof config.type === 'function' ? config.type().nullable() : config.type.nullable(),
      })],
    );
  }

  /**
   * This method is a private implementation detail and should not be used
   * outside of `StrongObjectType`!
   */
  public _fieldNonNull <TFieldValue, TArgs>(config: StrongFieldConfig<TValue, TArgs, TContext, TFieldValue>): StrongNullableObjectType<TValue, TContext> {
    this._assertUniqueFieldName(config.name);
    return new StrongNullableObjectType(
      this._strongConfig,
      this._strongInterfaces,
      [...this._strongFieldConfigs, trimDescriptionsInConfig(config)],
    );
  }

  /**
   * This method is a private implementation detail and should not be used
   * outside of `StrongObjectType`!
   */
  public _implement<TFieldMap extends StrongInterfaceFieldMap>(
    interfaceType: StrongInterfaceType<TValue, TFieldMap>,
    implementation: StrongInterfaceImplementation<TValue, TContext, TFieldMap>,
  ): StrongNullableObjectType<TValue, TContext> {
    // Get the field config map from our interface.
    const fieldConfigMap = interfaceType._getFieldConfigMap();
    // Create all of the object fields from our interface fields and the
    // implementation argument.
    const fieldConfigs = Object.keys(fieldConfigMap).map<StrongFieldConfig<TValue, {}, TContext, {}>>(fieldName => {
      // Make sure that this interface field name has not already been taken.
      this._assertUniqueFieldName(fieldName);
      // Get what we will need to create this field.
      const fieldConfig = fieldConfigMap[fieldName];
      const fieldResolver = implementation[fieldName];
      // Create a field.
      return trimDescriptionsInConfig({
        name: fieldName,
        description: fieldConfig.description,
        deprecationReason: fieldConfig.deprecationReason,
        type: fieldConfig.type,
        args: fieldConfig.args,
        resolve: fieldResolver,
      });
    });
    // Create a new strong nullable object type with our new fields and our new
    // interface.
    return new StrongNullableObjectType(
      this._strongConfig,
      [...this._strongInterfaces, interfaceType],
      [...this._strongFieldConfigs, ...fieldConfigs],
    );
  }
}
