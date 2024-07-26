type Paths<Schema, Path extends string = ""> = Schema extends string
  ? Path
  : Schema extends object
    ? {
        [K in keyof Schema & string]: Paths<
          Schema[K],
          `${Path}${Path extends "" ? "" : "."}${K}`
        >
      }[keyof Schema & string]
    : never

export type IntlKeysPath = Paths<IntlMessages>
