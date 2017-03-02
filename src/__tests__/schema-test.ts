import { graphql, GraphQLError } from 'graphql';
import { createObjectType } from '../object';
import { IntegerType } from '../wrap';
import { createSchema } from '../schema';

const QueryType = createObjectType({ name: 'Query' })
  .field({ name: 'a', type: IntegerType, resolve: () => 1 })
  .field({ name: 'b', type: IntegerType, resolve: () => 2 })
  .field({ name: 'c', type: IntegerType, resolve: () => 3 });

const MutationType = createObjectType({ name: 'Mutation' })
  .field({ name: 'a', type: IntegerType, resolve: () => 1 })
  .field({ name: 'b', type: IntegerType, resolve: () => 2 })
  .field({ name: 'c', type: IntegerType, resolve: () => 3 });

test('will execute the onExecute function if provided for queries', async() => {
  const onExecute = jest.fn();
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const source1 = Symbol('source1');
  const source2 = Symbol('source2');
  const context1 = Symbol('context1');
  const context2 = Symbol('context2');
  expect(await graphql(schema, '{ a b c }', source1, context1)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(await graphql(schema, '{ a b c }', source2, context2)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(onExecute.mock.calls.length).toBe(2);
  expect(onExecute.mock.calls[0].length).toBe(3);
  expect(onExecute.mock.calls[0][0]).toBe(source1);
  expect(onExecute.mock.calls[0][1]).toBe(context1);
  expect(onExecute.mock.calls[1].length).toBe(3);
  expect(onExecute.mock.calls[1][0]).toBe(source2);
  expect(onExecute.mock.calls[1][1]).toBe(context2);
});

test('will propogate errors thrown in the onExecute function for queries', async() => {
  const error = Symbol('error');
  const onExecute = jest.fn(() => { throw error; });
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const result1 = await graphql(schema, '{ a b c }');
  const result2 = await graphql(schema, '{ a b c }');
  expect(result1.data).toEqual({ a: null, b: null, c: null });
  expect(result1.errors.length).toBe(3);
  expect(result2.data).toEqual({ a: null, b: null, c: null });
  expect(result2.errors.length).toBe(3);
});

test('will execute the onExecute function if provided for queries and resolve if it is a promise', async() => {
  const onExecute = jest.fn(() => new Promise(resolve => setTimeout(resolve, 5)));
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const source1 = Symbol('source1');
  const source2 = Symbol('source2');
  const context1 = Symbol('context1');
  const context2 = Symbol('context2');
  expect(await graphql(schema, '{ a b c }', source1, context1)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(await graphql(schema, '{ a b c }', source2, context2)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(onExecute.mock.calls.length).toBe(2);
  expect(onExecute.mock.calls[0].length).toBe(3);
  expect(onExecute.mock.calls[0][0]).toBe(source1);
  expect(onExecute.mock.calls[0][1]).toBe(context1);
  expect(onExecute.mock.calls[1].length).toBe(3);
  expect(onExecute.mock.calls[1][0]).toBe(source2);
  expect(onExecute.mock.calls[1][1]).toBe(context2);
});

test('will propogate errors thrown in the onExecute function for queries if it is a rejected promise', async() => {
  const error = Symbol('error');
  const onExecute = jest.fn(() => new Promise((resolve, reject) => setTimeout(() => reject(error), 5)));
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const result1 = await graphql(schema, '{ a b c }');
  const result2 = await graphql(schema, '{ a b c }');
  expect(result1.data).toEqual({ a: null, b: null, c: null });
  expect(result1.errors.length).toBe(3);
  expect(result2.data).toEqual({ a: null, b: null, c: null });
  expect(result2.errors.length).toBe(3);
});

test('will execute the onExecute function if provided for mutations', async() => {
  const onExecute = jest.fn();
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const source1 = Symbol('source1');
  const source2 = Symbol('source2');
  const context1 = Symbol('context1');
  const context2 = Symbol('context2');
  expect(await graphql(schema, 'mutation { a b c }', source1, context1)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(await graphql(schema, 'mutation { a b c }', source2, context2)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(onExecute.mock.calls.length).toBe(2);
  expect(onExecute.mock.calls[0].length).toBe(3);
  expect(onExecute.mock.calls[0][0]).toBe(source1);
  expect(onExecute.mock.calls[0][1]).toBe(context1);
  expect(onExecute.mock.calls[1].length).toBe(3);
  expect(onExecute.mock.calls[1][0]).toBe(source2);
  expect(onExecute.mock.calls[1][1]).toBe(context2);
});

test('will propogate errors thrown in the onExecute function for mutations', async() => {
  const error = Symbol('error');
  const onExecute = jest.fn(() => { throw error; });
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const result1 = await graphql(schema, 'mutation { a b c }');
  const result2 = await graphql(schema, 'mutation { a b c }');
  expect(result1.data).toEqual({ a: null, b: null, c: null });
  expect(result1.errors.length).toBe(3);
  expect(result2.data).toEqual({ a: null, b: null, c: null });
  expect(result2.errors.length).toBe(3);
});

test('will execute the onExecute function if provided for mutations and resolve if it is a promise', async() => {
  const onExecute = jest.fn(() => new Promise(resolve => setTimeout(resolve, 5)));
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const source1 = Symbol('source1');
  const source2 = Symbol('source2');
  const context1 = Symbol('context1');
  const context2 = Symbol('context2');
  expect(await graphql(schema, 'mutation { a b c }', source1, context1)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(await graphql(schema, 'mutation { a b c }', source2, context2)).toEqual({ data: { a: 1, b: 2, c: 3 } });
  expect(onExecute.mock.calls.length).toBe(2);
  expect(onExecute.mock.calls[0].length).toBe(3);
  expect(onExecute.mock.calls[0][0]).toBe(source1);
  expect(onExecute.mock.calls[0][1]).toBe(context1);
  expect(onExecute.mock.calls[1].length).toBe(3);
  expect(onExecute.mock.calls[1][0]).toBe(source2);
  expect(onExecute.mock.calls[1][1]).toBe(context2);
});

test('will propogate errors thrown in the onExecute function for mutations if it is a rejected promise', async() => {
  const error = Symbol('error');
  const onExecute = jest.fn(() => new Promise((resolve, reject) => setTimeout(() => reject(error), 5)));
  const schema = createSchema({
    query: QueryType,
    mutation: MutationType,
    onExecute,
  });
  const result1 = await graphql(schema, 'mutation { a b c }');
  const result2 = await graphql(schema, 'mutation { a b c }');
  expect(result1.data).toEqual({ a: null, b: null, c: null });
  expect(result1.errors.length).toBe(3);
  expect(result2.data).toEqual({ a: null, b: null, c: null });
  expect(result2.errors.length).toBe(3);
});
