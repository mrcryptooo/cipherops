// Simplified version of packages/fhevm-sdk/src/internal/PublicKeyStorage.ts
// Original uses IndexedDB via the `idb` package (not installed in this project).
// Replaced with an in-memory Map for Phase 2 MVP. The public key cache
// is only a performance optimisation — without it the SDK fetches the key
// from the relayer on every page load, which is acceptable for now.

type FhevmStoredPublicKey = { publicKeyId: string; publicKey: Uint8Array } | null;
type FhevmStoredPublicParams = { publicParamsId: string; publicParams: Uint8Array } | null;

type FhevmPublicKeyType = { data: Uint8Array; id: string };
type FhevmPkeCrsType = { publicParams: Uint8Array; publicParamsId: string };
type FhevmPkeCrsByCapacityType = { 2048: FhevmPkeCrsType };

const _keyStore = new Map<string, FhevmStoredPublicKey>();
const _paramsStore = new Map<string, FhevmStoredPublicParams>();

export async function publicKeyStorageGet(aclAddress: `0x${string}`): Promise<{
  publicKey?: FhevmPublicKeyType;
  publicParams?: FhevmPkeCrsByCapacityType;
}> {
  const pk = _keyStore.get(aclAddress);
  const pp = _paramsStore.get(aclAddress);
  const result: { publicKey?: FhevmPublicKeyType; publicParams?: FhevmPkeCrsByCapacityType } = {};
  if (pk) result.publicKey = { id: pk.publicKeyId, data: pk.publicKey };
  if (pp) result.publicParams = { 2048: pp };
  return result;
}

export async function publicKeyStorageSet(
  aclAddress: `0x${string}`,
  publicKey: FhevmStoredPublicKey,
  publicParams: FhevmStoredPublicParams,
): Promise<void> {
  if (publicKey) _keyStore.set(aclAddress, publicKey);
  if (publicParams) _paramsStore.set(aclAddress, publicParams);
}
