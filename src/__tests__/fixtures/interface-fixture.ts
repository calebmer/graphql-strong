import {
  StrongGraphQLInputType,
  StrongGraphQLOutputType,
  StrongGraphQLInputOutputType,
  StringType,
  FloatType,
  IntegerType,
  createNullableType,
  createInterfaceType,
} from '../../index'

interface Person {
  name: string
  email: string
  imageURL?: string
}

interface Image {
  url: string
  size?: number
}

const PersonType = createInterfaceType<Person>({
  name: 'Person',
})

const ImageType = createInterfaceType<Image>({
  name: 'Image',
})

// All good image
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: StringType,
  })
  .field<number>({
    name: 'size',
    type: FloatType,
  })

// All good person
PersonType
  .fieldNonNull<string>({
    name: 'name',
    type: StringType,
  })
  .fieldNonNull<string>({
    name: 'email',
    type: StringType,
  })
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: IntegerType,
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Wrong type 1
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: FloatType,
  })

// Wrong type 2
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: PersonType,
  })

// No input types in output type position
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: (null as any) as StrongGraphQLInputType<string>,
  })

// Input-output types in output type position ok
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: (null as any) as StrongGraphQLInputOutputType<string>,
  })

// Non-null field configured to be createNullableType
ImageType
  .fieldNonNull<string | null | undefined>({
    name: 'url',
    type: createNullableType(StringType),
  })

// Nullable type in non-null field
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: createNullableType(StringType),
  })

// Nullable type in createNullableType field
ImageType
  .field<number>({
    name: 'size',
    type: createNullableType(FloatType),
  })

// Field with arguments wrong type
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: StringType,
    args: {
      width: {
        type: IntegerType,
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Arguments wrong type 1
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: StringType,
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Arguments wrong type 2
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: IntegerType,
      },
      height: {
        type: createNullableType(StringType),
      },
    },
  })

// Missing arguments definition
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
  })

// Missing single argument 1
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Missing single argument 2
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: IntegerType,
      },
    },
  })

// Nullable argument in non-null position
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: createNullableType(IntegerType),
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Extra argument definitions
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: IntegerType,
      },
      height: {
        type: createNullableType(IntegerType),
      },
      x: { type: StringType },
      y: { type: StringType },
      z: { type: StringType },
    },
  })

// Argument input type passes
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: (null as any) as StrongGraphQLInputType<number>,
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Argument output type fails
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: (null as any) as StrongGraphQLOutputType<number>,
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Argument input-output type fails
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    args: {
      width: {
        type: (null as any) as StrongGraphQLInputOutputType<number>,
      },
      height: {
        type: createNullableType(IntegerType),
      },
    },
  })

// Un-thunked recursion fails
{
  const type: StrongGraphQLOutputType<Person> = createInterfaceType<Person>({
    name: 'foo',
  })
    .fieldNonNull<Person>({
      name: 'recursive',
      type: type,
    })
}

// Thunked recursion passes
{
  const type: StrongGraphQLOutputType<Person> = createInterfaceType<Person>({
    name: 'foo',
  })
    .fieldNonNull<Person>({
      name: 'recursive',
      type: () => type,
    })
}
