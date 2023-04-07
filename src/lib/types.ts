import type { ZodBoolean, ZodDate, ZodNumber, ZodString } from 'zod';

export type FormInputType = 'string' | 'number' | 'boolean' | 'date' | 'id';
export type TournamentType = 'Teams' | 'Solo';

export type AssignFieldType<
  T extends Record<string, unknown>,
  K extends keyof T,
  Str,
  Num,
  Bool,
  DateTime,
  Default
> = T[K] extends string
  ? Str
  : T[K] extends string | undefined
  ? Str
  : T[K] extends number
  ? Num
  : T[K] extends number | undefined
  ? Num
  : T[K] extends boolean
  ? Bool
  : T[K] extends boolean | undefined
  ? Bool
  : T[K] extends Date | object
  ? DateTime
  : Default;

export interface SessionUser {
  id: number;
  osuUserId: number;
  username: string;
  discordTag: string;
  isAdmin: boolean;
  updatedAt: Date;
}

export interface Field {
  label: string;
  mapToKey: string;
  type: FormInputType;
  optional?: boolean;
  validation?: ZodString | ZodNumber | ZodBoolean | ZodDate;
  disableIf?: (currentValue: Record<string, unknown>) => boolean;
  multipleValues?: boolean;
  values: string[] | number[];
  selectMultiple?: boolean;
  onSearch?: () => Promise<Record<string, unknown>>;
  mapResult?: MapResult;
  errorCount: number;
}

export interface MapResult {
  label: (result: Record<string, unknown>) => string;
  imgRef?: (result: Record<string, unknown>) => string;
}

export interface InputEvent extends Event {
  currentTarget: EventTarget & HTMLInputElement;
}
