# Strong GraphQL

[![Package on npm](https://img.shields.io/npm/v/graphql-strong.svg?style=flat)](https://www.npmjs.com/package/graphql-strong)

One of the biggest reasons to use [GraphQL](http://graphql.org/) is its static type system. This type system makes it easy for GraphQL clients to do interesting optimizations and allows for powerful developer tools. Including GraphQL API development tools.

Strong GraphQL, or `graphql-strong`, is a library that leverages TypeScript types to give you the power of static type analysis when defining your GraphQL API in JavaScript. With the reference [`graphql-js`](github.com/graphql/graphql-js) implementation you can’t get the type safety GraphQL provides when building your API, but with Strong GraphQL you can.

## Installation
Strong GraphQL requires GraphQL-JS, TypeScript version 2.1 or higher, and Node.js 6.x or higher.

It is recommended that you set `noImplicitAny` to `true` and `strictNullChecks` to `true` in your TypeScript configuration to get the most accuracy possible from Strong GraphQL.

It is also recommended that you use [Visual Studio Code](https://code.visualstudio.com/) for the best developer experience possible.

You can use Strong GraphQL without TypeScript, however then you lose the strong typing guarantees that makes Strong GraphQL useful. Strong GraphQL depends on some TypeScript features and so does not have Flow types.

```bash
npm install graphql --save
npm install graphql-strong --save
npm install typescript --save-dev
npm install @types/graphql --save-dev
```

## Example
In the below example, we define the `Image` and `Person` GraphQL types.

```ts
import { createObjectType, StringType, FloatType, IntegerType } from 'graphql-strong'

interface Image {
  url: string
  width?: number
  height?: number
}

const ImageType = createObjectType<Image>({
  name: 'Image',
})
  .fieldNonNull<string>({
    name: 'url',
    type: StringType,
    resolve: ({ url }) => url,
  })
  .field<number>({
    name: 'width',
    type: FloatType,
    resolve: ({ width }) => width,
  })
  .field<number>({
    name: 'height',
    type: FloatType,
    resolve: ({ height }) => height,
  })

interface Person {
  name: string
  email: string
  imageURL?: string
}

const PersonType = createObjectType<Person>({
  name: 'Person',
})
  .fieldNonNull<string>({
    name: 'name',
    type: StringType,
    resolve: ({ name }) => name,
  })
  .fieldNonNull<string>({
    name: 'email',
    type: StringType,
    resolve: ({ email }) => email,
  })
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: IntegerType,
      },
      height: {
        type: IntegerType.nullable(),
      },
    },
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  })
```

Which in the GraphQL schema definition will look like:

```graphql
type Image {
  url: String!
  width: Float
  height: Float
}

type Person {
  name: String!
  email: String!
  image(width: Float!, height: Float): Image
}
```

Nice! But the real power of Strong GraphQL is in catching code *that should not work*.

```ts
const ImageType = createObjectType<Image>({
  name: 'Image',
})
  .fieldNonNull<string>({
    name: 'url',
    type: FloatType, // Error: expected a `StringType`.
    resolve: () => null, // Error: expected a `string` to be returned, not `null`.
  })
  .field<number>({
    name: 'size',
    type: FloatType,
    resolve: ({ doesNotExist }) => doesNotExist, // Error: could not find property `doesNotExist` on type `Image`.
  })

const PersonType = createObjectType<Person>({
  name: 'Person',
})
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: { // Error: missing `height` argument definition, only found `width`.
      width: {
        type: IntegerType.nullable(), // Error: `width` type should not be nullable.
      },
    },
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  })
```

The object types you create with Strong GraphQL are also interoperable with GraphQL-JS objects.

```ts
import { GraphQLObjectType, GraphQLID } from 'graphql'

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    personByID: {
      type: PersonType, // <-- This is the same type we defined above with Strong GraphQL.
      args: {
        id: { type: GraphQLID },
      },
      resolve: () => { ... },
    },
  },
})
```

## API
Before we dive into all of the Strong GraphQL functions, let’s take a moment to understand how the type system is set up.

All Strong GraphQL Types inherit from one of three interfaces: `StrongGraphQLInputType<TValue>` like an input object type, `StrongGraphQLOutputType<TValue>`s like an object or union type, and `StrongGraphQLInputOutputType<TValue>`s like an enum or scalar type.

Input and output types respectively may only be used in certain locations, but input-output types can be used in either input or output locations.

The `TValue` generic type associated with all Strong GraphQL Types is used for type checking. It represents the type of a value at runtime.

So for example the `StringType` variable has a type of `StrongGraphQLInputOutputType<string>` which means it can be used as either an input or an output type, and at runtime its type is a string.

Now, on to explaining what each function does:

### `createObjectType<TValue, TContext?>(config): StrongGraphQLObjectType<TValue, TContext>`
Creates a Strong GraphQL Object Type which you can add fields to using a chaining API. The `StrongGraphQLObjectType` that `createObjectType` returns extends the GraphQL-JS `GraphQLObjectType` class and so inherits all of that class’s methods. This type will be non-null.

The first type argument, `TValue`, will be the type of the first argument in the resolve function for your fields.

The second type argument, `TContext`, is optional and will be used as the type for the context in your field resolve functions. If not provided this type defaults to the empty object type: `{}`.

The first argument, `config`, can take the following properties:

- `name: string`: The required name of your type.
- `description?: string`: An optional description of your type.
- `isTypeOf: (value: any, context: TContext) => value is TValue`: A function you define which will verify if a value is indeed of the type you created.

Examples:

```ts
const ImageType = createObjectType<Image>({
  name: 'Image',
  description: 'A visual representation of a subject that can be found somewhere on the internet.',
})

const PersonType = createObjectType<Person, { imageService: ImageService }>({
  name: 'Person',
  isTypeOf: value => value instanceof Person,
})
```

### `StrongGraphQLObjectType<TValue, TContext>#field<TFieldValue, TArgs?>(config): StrongGraphQLObjectType<TValue, TContext>`
Returns a *new* Strong GraphQL Object Type with a new field added on. It is important to remember that this function does not mutate your type, but instead returns a new one.

This method always creates fields with a nullable type. This is because you can always make a field non-null without introducing a breaking change into your API, but you can never take a non-null field and make it nullable unless you want to introduce a breaking change. To create a field that is non-null use `fieldNonNull`.

The first type argument, `TFieldValue`, is the type of the field being resolved.

The second optional type argument, `TArgs`, is the type of the arguments we expect for this field. By default it is the empty object type: `{}`.

The first argument, `config`, can take the following properties:

- `name: string`: The required name of this field. If the name is not unique, an error will be thrown.
- `description?: string`: The optional description of the field.
- `deprecationReason?: string`: If you chose to deprecate this field, this is the optional reason why.
- `type: StrongGraphQLOutputType<TFieldValue> | (() => StrongGraphQLOutputType<TFieldValue>)`: The type of the field. Note that the type may be any `StrongGraphQLOutputType`, or a function that returns a `StrongGraphQLOutputType`. This allows you to use recursive types. Also note that whatever `StrongGraphQLOutputType` you use, it’s type must match up with the field’s type. This type will automatically be converted into a nullable type. If you do not want this type to automatically be converted into a nullable type use `fieldNonNull` instead.
- `args?: StrongGraphQLArgsConfig<TArgs>`: An argument definition map which matches your `TArgs` type. We will go into this more below.
- `resolve: (source: TValue, args: TArgs, context: TContext) => TFieldValue`: Your resolver function. It takes the object value, arguments, and context as parameters and returns the field value. This function may also return null. If your field *always* returns a value, use `fieldNonNull`.

Examples:

```ts
PersonType
  .field<Image, { width: number, height: number }>({
    name: 'image',
    description: 'Gets the image for our person with a provided width and height in pixels.',
    type: ImageType,
    args: {
      width: {
        type: IntegerType,
        description: 'The width of our image in pixels.',
      },
      height: {
        type: IntegerType,
        description: 'The height of our image in pixels.',
      },
    },
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  })
```

#### Arguments
The `args` property on your field config must *always* match the type you provided with `TArgs`. For instance, say you have arguments that look like this:

```ts
type Args = {
  width: number,
  height: number | null,
}
```

Then your `args` property *must* have a non-null number `width` definition and a nullable number `height` definition. Like so:

```ts
config.args = {
  width: {
    type: IntegerType,
  },
  height: {
    type: IntegerType.nullable(),
  },
}
```

If you change the type of one of your arguments, say to `StringType`, an error will be generated:

```ts
config.args = {
  width: {
    type: StringType, // Error: expected a type matching `number` here, not `StringType`.
  },
  height: {
    type: IntegerType.nullable(),
  },
}
```

Your argument definitions may have the following properties:

- `type: StrongGraphQLInputType<TArgValue>`: The input type whose `TArgValue` must match the type in your `TArgs` type at the same property.
- `defaultValue?: TArgValue`: An optional default value for this argument.
- `description?: string`: An optional description of what this argument does.

### `StrongGraphQLObjectType<TValue, TContext>#fieldNonNull<TFieldValue, TArgs?>(config): StrongGraphQLObjectType<TValue, TContext>`
Just like `StrongGraphQLObjectType#field` except while `StrongGraphQLObjectType#field` will *always* create a field with a nullable type, this field will allow you to create a field with a non-null type.

It takes all the same arguments as `StrongGraphQLObjectType#field`.

Example:

```ts
const PersonType = createObjectType<Person>({
  name: 'Person',
})
  .fieldNonNull<string>({
    name: 'name',
    type: StringType,
    resolve: ({ name }) => name,
  })
```

Will become:

```graphql
type Person {
  name: String!
}
```

Whereas:

```ts
const PersonType = createObjectType<Person>({
  name: 'Person',
})
  .field<string>({
    name: 'name',
    type: StringType,
    resolve: ({ name }) => name,
  })
```

Becomes:

```graphql
type Person {
  name: String
}
```

The difference between `String!` and `String` is actually pretty huge. Make sure you know when a type needs to be non-null and when it doesn’t.

### `StrongGraphQLType<TValue>#nullable(): StrongGraphQLType<TValue | null | undefined>`
Every Strong GraphQL Type is non-null by default. This makes sense in a strongly-typed environment. To get the nullable variant of a type, just call `.nullable()`. This will return a new nullable type without mutating the type you called it on.

Calling `nullable` on a nullable type will just return the type.

Examples:

```ts
PersonType.nullable()
StringType.nullable()
FloatType.nullable()
```

### Disclaimer
Strong GraphQL is currently in an expiremental phase. It does not support all GraphQL features, and not all of the features it does support are documented!

If you are interested in using Strong GraphQL *let the author know*. You can do so by opening issues on this repo or sending tweets to [@calebmer](http://twitter.com/calebmer).
