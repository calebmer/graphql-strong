/**
 * Types used for arguments that are shared by objects, interfaces, directives
 * and other GraphQL constructs that use arguments.
 */

import { GraphQLFieldConfigArgumentMap } from 'graphql';
import { StrongInputType } from './type';

/**
 * A type which represents the GraphQL type definition of the argument
 * TypeScript type provided.
 */
export type StrongArgsConfig<TArgs> = {
  [TArg in keyof TArgs]: StrongArgConfig<TArgs[TArg]>
};

/**
 * A type which represents a single argument configuration.
 */
export type StrongArgConfig<TValue> = {
  readonly type: StrongInputType<TValue>,
  readonly defaultValue?: TValue,
  readonly description?: string | undefined,
};

/**
 * Turns a strong argument config into a weak argument map that can be fed into
 * GraphQL.js.
 */
export function getWeakArgsMap(args: StrongArgsConfig<any>): GraphQLFieldConfigArgumentMap {
  const weakArgs: GraphQLFieldConfigArgumentMap = {};
  for (const argName of Object.keys(args)) {
    const argConfig = args[argName];
    weakArgs[argName] = {
      type: argConfig.type.getWeakInputType(),
      defaultValue: argConfig.defaultValue,
      description: argConfig.description,
    };
  }
  return weakArgs;
}
