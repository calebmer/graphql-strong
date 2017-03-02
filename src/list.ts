import { GraphQLList, GraphQLNonNull } from 'graphql';
import { StrongInputType, StrongOutputType, StrongInputOutputType } from './type';

/**
 * Creates a strong list type where the inner type is whatever GraphQL strong
 * type is passed in.
 */
export function createListType <TValue>(type: StrongInputOutputType<TValue>): StrongInputOutputType<Array<TValue>>;
export function createListType <TValue>(type: StrongInputType<TValue>): StrongInputType<Array<TValue>>;
export function createListType <TValue>(type: StrongOutputType<TValue>): StrongOutputType<Array<TValue>>;
export function createListType <TValue>(type: StrongInputOutputType<TValue>): StrongInputOutputType<Array<TValue>> {
  const nullableListType: StrongInputOutputType<Array<TValue> | null | undefined> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: undefined as any,
    getWeakType: () => new GraphQLList(type.getWeakType()),
    getWeakInputType: () => new GraphQLList(type.getWeakInputType()),
    getWeakOutputType: () => new GraphQLList(type.getWeakOutputType()),
    nullable: () => nullableListType,
  };
  const listType: StrongInputOutputType<Array<TValue>> = {
    _strongType: true,
    _strongInputType: true,
    _strongOutputType: true,
    _strongValue: undefined as any,
    getWeakType: () => new GraphQLNonNull(new GraphQLList(type.getWeakType())),
    getWeakInputType: () => new GraphQLNonNull(new GraphQLList(type.getWeakInputType())),
    getWeakOutputType: () => new GraphQLNonNull(new GraphQLList(type.getWeakOutputType())),
    nullable: () => nullableListType,
  };
  return listType;
}
