// Source: packages/fhevm-sdk/src/FhevmDecryptionSignature.ts (zama-ai/dapps)
// Adapted: removed .js extensions from local imports.
import { GenericStringStorage } from "./storage/GenericStringStorage";
import { EIP712Type, FhevmDecryptionSignatureType, FhevmInstance } from "./fhevmTypes";
import { ethers } from "ethers";

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

class FhevmDecryptionSignatureStorageKey {
  readonly #contractAddresses: `0x${string}`[];
  readonly #userAddress: `0x${string}`;
  readonly #key: string;

  constructor(instance: FhevmInstance, contractAddresses: string[], userAddress: string, publicKey?: string) {
    if (!ethers.isAddress(userAddress)) {
      throw new TypeError(`Invalid address ${userAddress}`);
    }
    const sortedContractAddresses = (contractAddresses as `0x${string}`[]).sort();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptyEIP712 = (instance as any).createEIP712(publicKey ?? (ethers as any).ZeroAddress, sortedContractAddresses, 0, 0);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hash = (ethers as any).TypedDataEncoder.hash(
        emptyEIP712.domain,
        { UserDecryptRequestVerification: emptyEIP712.types.UserDecryptRequestVerification },
        emptyEIP712.message,
      );
      this.#contractAddresses = sortedContractAddresses;
      this.#userAddress = userAddress as `0x${string}`;
      this.#key = `${userAddress}:${hash}`;
    } catch (e) {
      throw e as Error;
    }
  }

  get contractAddresses(): `0x${string}`[] { return this.#contractAddresses; }
  get userAddress(): `0x${string}` { return this.#userAddress; }
  get key(): string { return this.#key; }
}

export class FhevmDecryptionSignature {
  readonly #publicKey: string;
  readonly #privateKey: string;
  readonly #signature: string;
  readonly #startTimestamp: number;
  readonly #durationDays: number;
  readonly #userAddress: `0x${string}`;
  readonly #contractAddresses: `0x${string}`[];
  readonly #eip712: EIP712Type;

  private constructor(parameters: FhevmDecryptionSignatureType) {
    if (!FhevmDecryptionSignature.checkIs(parameters)) {
      throw new TypeError("Invalid FhevmDecryptionSignatureType");
    }
    this.#publicKey = parameters.publicKey;
    this.#privateKey = parameters.privateKey;
    this.#signature = parameters.signature;
    this.#startTimestamp = parameters.startTimestamp;
    this.#durationDays = parameters.durationDays;
    this.#userAddress = parameters.userAddress;
    this.#contractAddresses = parameters.contractAddresses;
    this.#eip712 = parameters.eip712;
  }

  get privateKey() { return this.#privateKey; }
  get publicKey() { return this.#publicKey; }
  get signature() { return this.#signature; }
  get contractAddresses() { return this.#contractAddresses; }
  get startTimestamp() { return this.#startTimestamp; }
  get durationDays() { return this.#durationDays; }
  get userAddress() { return this.#userAddress; }

  static checkIs(s: unknown): s is FhevmDecryptionSignatureType {
    if (!s || typeof s !== "object") return false;
    if (!("publicKey" in s && typeof (s as Record<string, unknown>).publicKey === "string")) return false;
    if (!("privateKey" in s && typeof (s as Record<string, unknown>).privateKey === "string")) return false;
    if (!("signature" in s && typeof (s as Record<string, unknown>).signature === "string")) return false;
    if (!("startTimestamp" in s && typeof (s as Record<string, unknown>).startTimestamp === "number")) return false;
    if (!("durationDays" in s && typeof (s as Record<string, unknown>).durationDays === "number")) return false;
    if (!("contractAddresses" in s && Array.isArray((s as Record<string, unknown>).contractAddresses))) return false;
    for (const addr of (s as { contractAddresses: unknown[] }).contractAddresses) {
      if (typeof addr !== "string" || !addr.startsWith("0x")) return false;
    }
    if (!("userAddress" in s && typeof (s as Record<string, unknown>).userAddress === "string" && ((s as Record<string, unknown>).userAddress as string).startsWith("0x"))) return false;
    if (!("eip712" in s && typeof (s as Record<string, unknown>).eip712 === "object" && (s as Record<string, unknown>).eip712 !== null)) return false;
    return true;
  }

  toJSON() {
    return {
      publicKey: this.#publicKey,
      privateKey: this.#privateKey,
      signature: this.#signature,
      startTimestamp: this.#startTimestamp,
      durationDays: this.#durationDays,
      userAddress: this.#userAddress,
      contractAddresses: this.#contractAddresses,
      eip712: this.#eip712,
    };
  }

  static fromJSON(json: unknown) {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return new FhevmDecryptionSignature(data as FhevmDecryptionSignatureType);
  }

  equals(s: FhevmDecryptionSignatureType) {
    return s.signature === this.#signature;
  }

  isValid(): boolean {
    return _timestampNow() < this.#startTimestamp + this.#durationDays * 24 * 60 * 60;
  }

  async saveToGenericStringStorage(storage: GenericStringStorage, instance: FhevmInstance, withPublicKey: boolean) {
    try {
      const value = JSON.stringify(this);
      const storageKey = new FhevmDecryptionSignatureStorageKey(
        instance,
        this.#contractAddresses,
        this.#userAddress,
        withPublicKey ? this.#publicKey : undefined,
      );
      await storage.setItem(storageKey.key, value);
    } catch {
      // ignore
    }
  }

  static async loadFromGenericStringStorage(
    storage: GenericStringStorage,
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    publicKey?: string,
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const storageKey = new FhevmDecryptionSignatureStorageKey(instance, contractAddresses, userAddress, publicKey);
      const result = await storage.getItem(storageKey.key);
      if (!result) return null;
      try {
        const kps = FhevmDecryptionSignature.fromJSON(result);
        if (!kps.isValid()) return null;
        return kps;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  static async new(
    instance: FhevmInstance,
    contractAddresses: string[],
    publicKey: string,
    privateKey: string,
    signer: ethers.JsonRpcSigner,
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await signer.getAddress()) as `0x${string}`;
      const startTimestamp = _timestampNow();
      const durationDays = 365;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eip712 = (instance as any).createEIP712(publicKey, contractAddresses, startTimestamp, durationDays);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signature = await (signer as any).signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );
      return new FhevmDecryptionSignature({
        publicKey, privateKey,
        contractAddresses: contractAddresses as `0x${string}`[],
        startTimestamp, durationDays, signature,
        eip712: eip712 as EIP712Type,
        userAddress,
      });
    } catch {
      return null;
    }
  }

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: ethers.JsonRpcSigner,
    storage: GenericStringStorage,
    keyPair?: { publicKey: string; privateKey: string },
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = (await signer.getAddress()) as `0x${string}`;
    const cached = await FhevmDecryptionSignature.loadFromGenericStringStorage(
      storage, instance, contractAddresses, userAddress, keyPair?.publicKey,
    );
    if (cached) return cached;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { publicKey, privateKey } = keyPair ?? (instance as any).generateKeypair();
    const sig = await FhevmDecryptionSignature.new(instance, contractAddresses, publicKey, privateKey, signer);
    if (!sig) return null;
    await sig.saveToGenericStringStorage(storage, instance, Boolean(keyPair?.publicKey));
    return sig;
  }
}
