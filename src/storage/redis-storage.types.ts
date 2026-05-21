export type RedisMediaGroupStorageOptions = {
  keyPrefix?: string;
};

export type RedisCommandClient = {
  eval(
    script: string,
    options: {
      keys: string[];
      arguments: string[];
    },
  ): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: {
      PX?: number;
    },
  ): Promise<unknown>;
  del(key: string): Promise<unknown>;
};
