import { SeasonRow } from "../fields/schemas/seasons";
import { ZodObject } from "zod/v4";
import { Location } from "../mfid/schemas/lgu.schema";

export type ImportRow = Record<string, unknown>;
export type PreviewRow = ImportRow & { _originalIndex: number };

export interface ImportIssue {
  row: number;
  col: string;
  message: string;
  level?: "error" | "warning";
  value: unknown;
};

export type FileError = {
  message: string;
  missingColumns?: string[];
} | null;

export interface ValidationContext {
  locations: Location[];
  seasons: SeasonRow[];
  duplicateMap: Map<string, boolean>;
  schema: ZodObject<any>;
};
