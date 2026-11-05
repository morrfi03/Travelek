export type DatedLeg = {
  date?: string;
  time?: string;
  arrDate?: string;
  arrTime?: string;
};

export type TripRoute = DatedLeg & {
  id: string;
  from?: string;
  to?: string;
  mode?: string;
  fromCode?: string;
  toCode?: string;
};

export type Trip = {
  id: string;
  title: string;
  countries: string[];
  regions: string[];
  routes: string[];
};

export type Account = {
  id: string;
  login: string;
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user" | string;
  mustChange?: boolean;
  rev?: number;
  vladReset?: string;
};

export type City = {
  id?: string;
  n?: string;
  name?: string;
  lat?: number;
  lng?: number;
};

export type Airport = City & {
  code?: string;
};

export type Region = {
  id: string;
  n?: string;
  c?: string;
};

export type DiaryPack = Record<string, string | null | undefined>;

export type CloudVault = Record<string, DiaryPack>;
