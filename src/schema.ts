import { GraphQLSchema, graphql, ExecutionResult, GraphQLResolveInfo, defaultFieldResolver, OperationDefinitionNode } from 'graphql';
import { StrongGraphQLObjectType } from './object';

/**
 * Creates a strong, type-safe, GraphQL schema that forces correctness on
 * execution.
 */
export function createSchema <TValue>(config: StrongGraphQLSchemaConfig<TValue, {}>): StrongGraphQLSchema<TValue, {}>;
export function createSchema <TValue, TContext>(config: StrongGraphQLSchemaConfig<TValue, TContext>): StrongGraphQLSchema<TValue, TContext>;
export function createSchema <TValue, TContext>(config: StrongGraphQLSchemaConfig<TValue, TContext>): StrongGraphQLSchema<TValue, TContext> {
  return new StrongGraphQLSchema(config);
}

/**
 * The configuration for a strong GraphQL schema.
 */
export interface StrongGraphQLSchemaConfig<TValue, TContext> {
  readonly query: StrongGraphQLObjectType<TValue, TContext>;
  readonly mutation?: StrongGraphQLObjectType<TValue, TContext>;

  /**
   * Runs only once at the beginning of an execution for this schema.
   */
  onExecute?(value: TValue, context: TContext, info: GraphQLResolveInfo): void | Promise<void>;
}

/**
 * The strong GraphQL schema represents a type-safe GraphQL schema that forces
 * type correctness on execution with the `execute` method.
 */
export
class StrongGraphQLSchema<TValue, TContext>
extends GraphQLSchema {
  constructor(config: StrongGraphQLSchemaConfig<TValue, TContext>) {
    super({
      query: config.query.ofType.clone(),
      mutation: config.mutation && config.mutation.ofType.clone(),
    });

    const { onExecute } = config;

    // If we were given an `onExecute` function in the configuration then we
    // must add it to our root query types.
    if (onExecute) {
      const executedOperations = new WeakMap<OperationDefinitionNode, Promise<void>>();

      const rootTypes = [
        this.getQueryType(),
        this.getMutationType(),
      ].filter(Boolean);

      rootTypes.forEach(rootType => {
        const fields = rootType.getFields();

        for (const fieldName of Object.keys(fields)) {
          const resolver = fields[fieldName].resolve || defaultFieldResolver;

          // Wrap our resolver so that our `onExecute` handler runs if provided.
          fields[fieldName].resolve = async(source, args, context, info) => {
            // If we have not yet executed our root level `onExecute` function,
            // then call it.
            if (!executedOperations.has(info.operation)) {
              executedOperations.set(info.operation, Promise.resolve(onExecute(source, context, info)));
            }
            // Wait for our `onExecute` function to resolve or reject whether
            // `onExecute` was called here or not.
            await executedOperations.get(info.operation);

            return await resolver(source, args, context, info);
          };
        }
      });
    }
  }

  /**
   * A type-safe execution function for our strong GraphQL schema. With this
   * function you will be forced to provide values and contexts of the correct
   * types.
   */
  public execute(query: string, value: TValue, context: TContext, variables: { [key: string]: any } = {}, operation?: string): Promise<ExecutionResult> {
    return graphql(this, query, value, context, variables, operation);
  }
}
