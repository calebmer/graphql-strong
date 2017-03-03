import {
  StringType,
  IntegerType,
  createInterfaceType,
  createObjectType,
} from '../../index';

interface Person {
  name: string;
  email: string;
}

// All good
{
  const type = createInterfaceType<{
    foo: { type: string },
    bar: { type: string | null | undefined },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      foo: { type: StringType },
      bar: { type: StringType.nullable() },
    },
  });
}

// Bad field type 1
{
  const type = createInterfaceType<{
    foo: { type: string },
    bar: { type: string | null | undefined },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      foo: { type: IntegerType },
      bar: { type: StringType.nullable() },
    },
  });
}

// Bad field type 2
{
  const type = createInterfaceType<{
    foo: { type: string },
    bar: { type: string | null | undefined },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      foo: { type: StringType },
      bar: { type: IntegerType.nullable() },
    },
  });
}

// Missing field 1
{
  const type = createInterfaceType<{
    foo: { type: string },
    bar: { type: string | null | undefined },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      foo: { type: StringType },
    },
  });
}

// Missing field 2
{
  const type = createInterfaceType<{
    foo: { type: string },
    bar: { type: string | null | undefined },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      bar: { type: StringType.nullable() },
    },
  });
}

// All good with args
{
  const type = createInterfaceType<{
    x: {
      type: string,
      args: {
        foo: string,
        bar: string | null | undefined,
      },
    },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      x: {
        type: StringType,
        args: {
          foo: { type: StringType },
          bar: { type: StringType.nullable() },
        },
      },
    },
  });
}

// Bad arg type 1
{
  const type = createInterfaceType<{
    x: {
      type: string,
      args: {
        foo: string,
        bar: string | null | undefined,
      },
    },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      x: {
        type: StringType,
        args: {
          foo: { type: IntegerType },
          bar: { type: StringType.nullable() },
        },
      },
    },
  });
}

// Bad arg type 2
{
  const type = createInterfaceType<{
    x: {
      type: string,
      args: {
        foo: string,
        bar: string | null | undefined,
      },
    },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      x: {
        type: StringType,
        args: {
          foo: { type: StringType },
          bar: { type: IntegerType.nullable() },
        },
      },
    },
  });
}

// Missing arg 1
{
  const type = createInterfaceType<{
    x: {
      type: string,
      args: {
        foo: string,
        bar: string | null | undefined,
      },
    },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      x: {
        type: StringType,
        args: {
          foo: { type: StringType },
        },
      },
    },
  });
}

// Missing arg 2
{
  const type = createInterfaceType<{
    x: {
      type: string,
      args: {
        foo: string,
        bar: string | null | undefined,
      },
    },
  }>({
    name: 'Foobar',
    resolveType: undefined as any,
    fields: {
      x: {
        type: StringType,
        args: {
          bar: { type: StringType.nullable() },
        },
      },
    },
  });
}

// All good implementation
{
  const ActorType = createInterfaceType<{
    name: { type: string },
  }>({
    name: 'Actor',
    resolveType: undefined as any,
    fields: {
      name: {
        type: StringType,
      },
    },
  });

  const PersonType = createObjectType<Person>({
    name: 'Person',
  })
  .implement(ActorType, {
    name: ({ name }) => name,
  })
  .fieldNonNull({
    name: 'email',
    type: StringType,
    resolve: ({ email }) => email,
  });
}

// Missing field implementation
{
  const ActorType = createInterfaceType<{
    name: { type: string },
  }>({
    name: 'Actor',
    resolveType: undefined as any,
    fields: {
      name: {
        type: StringType,
      },
    },
  });

  const PersonType = createObjectType<Person>({
    name: 'Person',
  })
  .implement(ActorType, {

  })
  .fieldNonNull({
    name: 'email',
    type: StringType,
    resolve: ({ email }) => email,
  });
}

// Bad return type
{
  const ActorType = createInterfaceType<{
    name: { type: string },
  }>({
    name: 'Actor',
    resolveType: undefined as any,
    fields: {
      name: {
        type: StringType,
      },
    },
  });

  const PersonType = createObjectType<Person>({
    name: 'Person',
  })
  .implement(ActorType, {
    name: () => 42,
  })
  .fieldNonNull({
    name: 'email',
    type: StringType,
    resolve: ({ email }) => email,
  });
}
