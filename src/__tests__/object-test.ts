import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql'
import { StrongGraphQLOutputType, StrongGraphQLInputType } from '../type'
import { IntegerType } from '../wrap'
import { createObjectType } from '../object'

const mockOutputType = (): StrongGraphQLOutputType<string> => ({
  _strongType: true,
  _strongOutputType: true,
  _strongValue: null,
  _weakType: () => GraphQLString,
  _weakOutputType: () => GraphQLString,
  nullable: () => mockOutputType(),
})

const mockInputType = (): StrongGraphQLInputType<string> => ({
  _strongType: true,
  _strongInputType: true,
  _strongValue: null,
  _weakType: () => GraphQLString,
  _weakInputType: () => GraphQLString,
  nullable: () => mockInputType(),
})

test('will set the right name and description', () => {
  const name = 'foo'
  const description = 'bar'
  expect(createObjectType({ name }).ofType.name).toBe(name)
  expect(createObjectType({ name, description }).ofType.name).toBe(name)
  expect(createObjectType({ name, description }).ofType.description).toBe(description)
})

test('.nullable() will return the nullable version of the type', () => {
  const type = createObjectType({ name: 'foo' })
  expect(type.nullable()).toBe(type.ofType)
})

test('.getType() returns self', () => {
  const type = createObjectType({ name: 'foo' })
  expect(type._weakType()).toBe(type)
})

test('.getOutputType() returns self', () => {
  const type = createObjectType({ name: 'foo' })
  expect(type._weakOutputType()).toBe(type)
})

test('.nullable().getType() returns nullable type', () => {
  const type = createObjectType({ name: 'foo' })
  expect(type.nullable()._weakType()).toBe(type.ofType)
})

test('.nullable().getOutputType() returns nullable type', () => {
  const type = createObjectType({ name: 'foo' })
  expect(type.nullable()._weakOutputType()).toBe(type.ofType)
})

test('.field() will create a new object type', () => {
  const type = createObjectType({ name: 'foo' })
  expect(type.field<string>({ name: 'bar', type: mockOutputType(), resolve: () => 'baz' })).not.toBe(type)
})

test('.field().field() will create a new object type', () => {
  const type = createObjectType({ name: 'foo' }).field<string>({ name: 'bar', type: mockOutputType(), resolve: () => 'baz' })
  expect(type.field<string>({ name: 'buz', type: mockOutputType(), resolve: () => 'jit' })).not.toBe(type)
})

test('.field() will call .nullable() on the field type', () => {
  const outputType = mockOutputType()
  const nullableMock = jest.fn(() => mockOutputType())
  outputType.nullable = nullableMock
  createObjectType({ name: 'foo' }).field<string>({ name: 'bar', type: outputType, resolve: () => 'baz' }).ofType.getFields()
  expect(nullableMock.mock.calls).toEqual([[]])
})

test('.fieldNonNull() will not call .nullable() on the field type', () => {
  const outputType = mockOutputType()
  const nullableMock = jest.fn(() => mockOutputType)
  outputType.nullable = nullableMock
  createObjectType({ name: 'foo' }).fieldNonNull<string>({ name: 'bar', type: outputType, resolve: () => 'baz' })
  expect(nullableMock.mock.calls).toEqual([])
})

test('.field() will throw if there is already a field of that name', () => {
  expect(() =>
    createObjectType({ name: 'foo' })
      .field({ name: 'bar', type: mockOutputType(), resolve: () => 'baz' })
      .field({ name: 'bar', type: mockOutputType(), resolve: () => 'buz' })
  ).toThrowError('Type \'foo\' already has a field named \'bar\'.')
})

test('.fieldNonNull() will throw if there is already a field of that name', () => {
  expect(() =>
    createObjectType({ name: 'foo' })
      .fieldNonNull({ name: 'bar', type: mockOutputType(), resolve: () => 'baz' })
      .fieldNonNull({ name: 'bar', type: mockOutputType(), resolve: () => 'buz' })
  ).toThrowError('Type \'foo\' already has a field named \'bar\'.')
})

test('native object type fields will return a map with the correct static fields', () => {
  const fieldType1 = mockOutputType()
  const fieldType2 = mockOutputType()

  const type =
    createObjectType({ name: 'foo' })
      .field<string>({ name: 'bar', type: fieldType1, resolve: () => 'baz', description: 'description 1', deprecationReason: 'deprecation reason 1' })
      .field<string>({ name: 'buz', type: fieldType2, resolve: () => 'jit', description: 'description 2', deprecationReason: 'deprecation reason 2' })

  const fields = type.ofType.getFields()

  expect(Object.keys(fields)).toEqual(['bar', 'buz'])
  expect(fields['bar'].description).toBe('description 1')
  expect(fields['buz'].description).toBe('description 2')
  expect(fields['bar'].deprecationReason).toBe('deprecation reason 1')
  expect(fields['buz'].deprecationReason).toBe('deprecation reason 2')
  expect(Object.keys(fields['bar'].args)).toEqual([])
  expect(Object.keys(fields['buz'].args)).toEqual([])
})

test('native object type fields will call for the field type’s output type', () => {
  const fieldType1 = mockOutputType()
  const fieldType2 = mockOutputType()
  const fieldOutputType1 = Object.create(GraphQLString)
  const fieldOutputType2 = Object.create(GraphQLString)
  const weakOutputTypeMock1 = jest.fn(() => fieldOutputType1)
  const weakOutputTypeMock2 = jest.fn(() => fieldOutputType2)
  fieldType1._weakOutputType = weakOutputTypeMock1
  fieldType2._weakOutputType = weakOutputTypeMock2

  const type =
    createObjectType({ name: 'foo' })
      .fieldNonNull<string>({ name: 'bar', type: fieldType1, resolve: () => 'baz' })
      .fieldNonNull<string>({ name: 'buz', type: fieldType2, resolve: () => 'jit' })

  const fields = type.ofType.getFields()

  expect(Object.keys(fields)).toEqual(['bar', 'buz'])
  expect(weakOutputTypeMock1.mock.calls).toEqual([[]])
  expect(weakOutputTypeMock2.mock.calls).toEqual([[]])
  expect(fields['bar'].type).toBe(fieldOutputType1)
  expect(fields['buz'].type).toBe(fieldOutputType2)
})

test('native object type fields will pass through arguments into resolve functions', () => {
  const fieldType1 = mockOutputType()
  const fieldType2 = mockOutputType()
  const resolve1 = jest.fn(() => 'baz')
  const resolve2 = jest.fn(() => 'jit')

  const type =
    createObjectType({ name: 'foo' })
      .field<string>({ name: 'bar', type: fieldType1, resolve: resolve1 })
      .field<string>({ name: 'buz', type: fieldType2, resolve: resolve2 })

  const fields = type.ofType.getFields()

  const source1 = Symbol('source1')
  const args1 = { x: Symbol('args1.x') }
  const context1 = Symbol('context1')

  const source2 = Symbol('source2')
  const args2 = { x: Symbol('args2.x') }
  const context2 = Symbol('context2')

  expect(Object.keys(fields)).toEqual(['bar', 'buz'])
  expect(fields['bar'].resolve(source1, args1, context1, null as any)).toBe('baz')
  expect(fields['buz'].resolve(source2, args2, context2, null as any)).toBe('jit')
  expect(resolve1.mock.calls).toEqual([[source1, args1, context1]])
  expect(resolve2.mock.calls).toEqual([[source2, args2, context2]])
})

test('native object type fields will return fields with correct args', () => {
  const fieldType1 = mockOutputType()
  const fieldType2 = mockOutputType()

  const type =
    createObjectType({ name: 'foo' })
      .field<string>({
        name: 'bar',
        type: fieldType1,
        resolve: () => 'baz',
        args: {
          x: { type: mockInputType(), defaultValue: 'buz', description: 'description 1' },
          y: { type: mockInputType(), defaultValue: 'jit', description: 'description 2' },
        },
      })

  const fields = type.ofType.getFields()

  expect(Object.keys(fields)).toEqual(['bar'])
  expect(fields['bar'].args.length).toBe(2)
  expect(fields['bar'].args[0].name).toBe('x')
  expect(fields['bar'].args[1].name).toBe('y')
  expect(fields['bar'].args[0].defaultValue).toBe('buz')
  expect(fields['bar'].args[1].defaultValue).toBe('jit')
  expect(fields['bar'].args[0].description).toBe('description 1')
  expect(fields['bar'].args[1].description).toBe('description 2')
})

test('.execute() will execute a query against the object type', async () => {
  const type = createObjectType({ name: 'Foo' })
    .field({ name: 'a', type: IntegerType, resolve: () => 1 })
    .field({ name: 'b', type: IntegerType, resolve: () => 2 })
    .field({ name: 'c', type: IntegerType, resolve: () => 3 })

  expect(await type.execute(`
    {
      x: a
      y: b
      z: c
      ...foo
    }

    fragment foo on Foo {
      a
      b
      c
    }
  `, {}, {})).toEqual({
    data: {
      x: 1,
      y: 2,
      z: 3,
      a: 1,
      b: 2,
      c: 3,
    },
  })
})

test('.extend() will enhance a type with a function', () => {
  const type = createObjectType({ name: 'Foo' })
    .extend(t => t
      .field({ name: 'a', type: IntegerType, resolve: () => 1 })
      .field({ name: 'b', type: IntegerType, resolve: () => 2 })
      .field({ name: 'c', type: IntegerType, resolve: () => 3 }))

  const fields = type.ofType.getFields()

  expect(Object.keys(fields)).toEqual(['a', 'b', 'c'])
})
