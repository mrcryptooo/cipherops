// Source: packages/fhevm-sdk/src/storage/GenericStringStorage.ts (zama-ai/dapps)

export interface GenericStringStorage {
  getItem(key: string): string | Promise<string | null> | null;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export class GenericStringInMemoryStorage implements GenericStringStorage {
  readonly #store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.#store.has(key) ? (this.#store.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.#store.set(key, value);
  }
  removeItem(key: string): void {
    this.#store.delete(key);
  }
}
