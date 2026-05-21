export const withDefined = <TValue, TObject extends object>(
  value: TValue | undefined,
  build: (value: TValue) => TObject,
): TObject | {} => (value === undefined ? {} : build(value));
