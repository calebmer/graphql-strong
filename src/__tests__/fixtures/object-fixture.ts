import {
  StrongGraphQLInputType,
  StrongGraphQLOutputType,
  StrongGraphQLInputOutputType,
  StringType,
  FloatType,
  IntegerType,
  createNullableType,
  createObjectType,
} from '../../index';

interface Person {
  name: string;
  email: string;
  imageURL?: string;
}

interface Image {
  url: string;
  size?: number;
}

interface Context {
  ImageService: {
    cropImage: (url: string, size: number) => Image,
  };
}

const PersonType = createObjectType<Person>({
  name: 'Person',
});

const PersonTypeWithContext = createObjectType<Person, Context>({
  name: 'Person',
});

const ImageType = createObjectType<Image>({
  name: 'Image',
});

// All good image
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: StringType,
    resolve: ({ url }) => url,
  })
  .field<number>({
    name: 'size',
    type: FloatType,
    resolve: ({ size }) => size,
  });

// All good person
PersonType
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
        type: createNullableType(IntegerType),
      },
    },
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

// Wrong type 1
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: FloatType,
    resolve: ({ url }) => url,
  });

// Wrong type 2
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: PersonType,
    resolve: ({ url }) => url,
  });

// No input types in output type position
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: (null as any) as StrongGraphQLInputType<string>,
    resolve: ({ url }) => url,
  });

// Input-output types in output type position ok
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: (null as any) as StrongGraphQLInputOutputType<string>,
    resolve: ({ url }) => url,
  });

// Bad resolve return 1
ImageType
  .field<number>({
    name: 'size',
    type: FloatType,
    resolve: ({ size }) => 'not a number!',
  });

// Bad resolve return 2
ImageType
  .fieldNonNull<number>({
    name: 'size',
    type: FloatType,
    resolve: ({ size }) => size,
  });

// Non-null field configured to be createNullableType
ImageType
  .fieldNonNull<string | null | undefined>({
    name: 'url',
    type: createNullableType(StringType),
    resolve: ({ url }) => url,
  });

// Nullable type in non-null field
ImageType
  .fieldNonNull<string>({
    name: 'url',
    type: createNullableType(StringType),
    resolve: ({ url }) => url,
  });

// Nullable type in createNullableType field
ImageType
  .field<number>({
    name: 'size',
    type: createNullableType(FloatType),
    resolve: ({ size }) => size,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

// Missing arguments definition
PersonType
  .field<Image, { width: number, height: number | undefined }>({
    name: 'image',
    type: ImageType,
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

// No generic arguments type
PersonType
  .field<Image>({
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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

// Extra argument definitions don’t type-check
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
    resolve: ({ imageURL }, { width, height, x, y, z }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

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
    resolve: ({ imageURL }, { width, height }) => imageURL ? {
      url: imageURL,
      width,
      height,
    } : null,
  });

// Type with context passes
PersonTypeWithContext
  .field<Image>({
    name: 'smallImage',
    type: ImageType,
    resolve: ({ imageURL }, args, context) =>
      imageURL ? context.ImageService.cropImage(imageURL, 50) : null,
  });

// Type without context fails
PersonType
  .field<Image>({
    name: 'smallImage',
    type: ImageType,
    resolve: ({ imageURL }, args, context) =>
      imageURL ? context.ImageService.cropImage(imageURL, 50) : null,
  });

// Un-thunked recursion fails
{
  const type: StrongGraphQLOutputType<Person> = createObjectType<Person>({
    name: 'foo',
  })
    .fieldNonNull<Person>({
      name: 'recursive',
      type,
      resolve: value => value,
    });
}

// Thunked recursion passes
{
  const type: StrongGraphQLOutputType<Person> = createObjectType<Person>({
    name: 'foo',
  })
    .fieldNonNull<Person>({
      name: 'recursive',
      type: () => type,
      resolve: value => value,
    });
}

// Returns a promise passes
ImageType
  .field<number>({
    name: 'size',
    type: FloatType,
    resolve: ({ size }) => Promise.resolve(size),
  });

// Returns a promise of a different type fails
ImageType
  .field<number>({
    name: 'size',
    type: FloatType,
    resolve: () => Promise.resolve('not a number!'),
  });
