import type { ValueTransformer } from 'typeorm';

export const numericTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null) => value == null ? 0 : Number(value),
};
