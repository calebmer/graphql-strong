/**
 * A utility function for creating GraphQL descriptions out of a multiline
 * template string.
 *
 * It trims whitespace from the beginning and end of the string in addition to
 * removing indentation.
 */
export function trimDescription (description: string): string {
  return description.replace(/^ +/gm, '').trim()
}

/**
 * Runs `trimDescription` on all properties named `description` deeply in a
 * config object.
 *
 * Creates a new config object instead of mutating the config object passed in.
 */
export function trimDescriptionsInConfig <T extends { [key: string]: any }>(config: T): T {
  const nextConfig: { [key: string]: any } = {}

  // Iterate through every key in the config object.
  for (const key of Object.keys(config)) {
    const value = config[key]

    // If the value at this key is an object we need to recurse this function.
    if (value !== null && typeof value === 'object') {
      nextConfig[key] = trimDescriptionsInConfig(value)
    }
    // If this key is `description` and the value is a string then we need to
    // trim the description.
    else if (key === 'description' && typeof value === 'string') {
      nextConfig[key] = trimDescription(value)
    }
    // Otherwise just copy the value over to the new config.
    else {
      nextConfig[key] = value
    }
  }

  return nextConfig as T
}
