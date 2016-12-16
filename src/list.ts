import { GraphQLList, GraphQLNonNull } from 'graphql'
import { StrongGraphQLInputType, StrongGraphQLOutputType, StrongGraphQLInputOutputType } from './type'

/**
 * Creates a strong list type where the inner type is whatever GraphQL strong
 * type is passed in.
 */
export function createListType <TValue>(type: StrongGraphQLInputOutputType<TValue>): StrongGraphQLInputOutputType<Array<TValue>>
export function createListType <TValue>(type: StrongGraphQLInputType<TValue>): StrongGraphQLInputType<Array<TValue>>
export function createListType <TValue>(type: StrongGraphQLOutputType<TValue>): StrongGraphQLOutputType<Array<TValue>>
export function createListType <TValue>(type: StrongGraphQLInputOutputType<TValue>): StrongGraphQLInputOutputType<Array<TValue>> {
  const nullableListType: StrongGraphQLInputOutputType<Array<TValue> | null | undefined> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: null,
    _weakType: () => new GraphQLList(type._weakType()),
    _weakInputType: () => new GraphQLList(type._weakInputType()),
    _weakOutputType: () => new GraphQLList(type._weakOutputType()),
    nullable: () => nullableListType,
  }
  const listType: StrongGraphQLInputOutputType<Array<TValue>> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: null,
    _weakType: () => new GraphQLNonNull(new GraphQLList(type._weakType())),
    _weakInputType: () => new GraphQLNonNull(new GraphQLList(type._weakInputType())),
    _weakOutputType: () => new GraphQLNonNull(new GraphQLList(type._weakOutputType())),
    nullable: () => nullableListType,
  }
  return listType
}
