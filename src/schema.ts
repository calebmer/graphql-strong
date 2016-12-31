import { GraphQLSchema, graphql, ExecutionResult } from 'graphql'
import { StrongGraphQLObjectType } from './object'

/**
 * Creates a strong, type-safe, GraphQL schema that forces correctness on
 * execution.
 */
export function createSchema <TValue>(config: StrongGraphQLSchemaConfig<TValue, {}>): StrongGraphQLSchema<TValue, {}>
export function createSchema <TValue, TContext>(config: StrongGraphQLSchemaConfig<TValue, TContext>): StrongGraphQLSchema<TValue, TContext>
export function createSchema <TValue, TContext>(config: StrongGraphQLSchemaConfig<TValue, TContext>): StrongGraphQLSchema<TValue, TContext> {
  return new StrongGraphQLSchema(config)
}

/**
 * The configuration for a strong GraphQL schema.
 */
export interface StrongGraphQLSchemaConfig<TValue, TContext> {
  readonly query: StrongGraphQLObjectType<TValue, TContext>
  readonly mutation?: StrongGraphQLObjectType<TValue, TContext>
  readonly subscription?: StrongGraphQLObjectType<TValue, TContext>
}

/**
 * The strong GraphQL schema represents a type-safe GraphQL schema that forces
 * type correctness on execution with the `execute` method.
 */
export
class StrongGraphQLSchema<TValue, TContext>
extends GraphQLSchema {
  constructor (config: StrongGraphQLSchemaConfig<TValue, TContext>) {
    super({
      query: config.query.ofType,
      mutation: config.mutation && config.mutation.ofType,
      subscription: config.subscription && config.subscription.ofType,
    })
  }

  /**
   * A type-safe execution function for our strong GraphQL schema. With this
   * function you will be forced to provide values and contexts of the correct
   * types.
   */
  public execute (query: string, value: TValue, context: TContext, variables: { [key: string]: any } = {}, operation?: string): Promise<ExecutionResult> {
    return graphql(this, query, value, context, variables, operation)
  }
}
