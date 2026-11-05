export type WorldPlace = {
  code?: string;
  n?: string;
  lat?: number;
  lng?: number;
};

export type WorldIndex = {
  ready: boolean;
  loading: boolean;
  byCode: Record<string, WorldPlace>;
  ab: Record<string, number[]>;
  cb: Record<string, number[]>;
  air: unknown[] | null;
  cities: unknown[] | null;
};

export const WORLD: WorldIndex = {
  ready: false,
  loading: false,
  byCode: {},
  ab: {},
  cb: {},
  air: null,
  cities: null
};
