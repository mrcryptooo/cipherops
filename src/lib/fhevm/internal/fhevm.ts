// Source: packages/fhevm-sdk/src/internal/fhevm.ts (zama-ai/dapps)
// Adapted: removed .js extensions; fixed two typos in SepoliaConfig references;
//          removed Hardhat/mock code path (Sepolia-only in this project).
import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
import type { FhevmInitSDKOptions, FhevmInitSDKType, FhevmLoadSDKType, FhevmWindowType } from "./fhevmTypes";
import { isFhevmWindowType, RelayerSDKLoader } from "./RelayerSDKLoader";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage";
import { FhevmInstance, FhevmInstanceConfig } from "../fhevmTypes";

export class FhevmReactError extends Error {
  code: string;
  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "FhevmReactError";
  }
}

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

function throwFhevmError(code: string, message?: string, cause?: unknown): never {
  throw new FhevmReactError(code, message, cause ? { cause } : undefined);
}

const isFhevmInitialized = (): boolean => {
  if (!isFhevmWindowType(window)) return false;
  return (window as unknown as FhevmWindowType).relayerSDK.__initialized__ === true;
};

const fhevmLoadSDK: FhevmLoadSDKType = () => {
  const loader = new RelayerSDKLoader({ trace: console.log });
  return loader.load();
};

const fhevmInitSDK: FhevmInitSDKType = async (options?: FhevmInitSDKOptions) => {
  if (!isFhevmWindowType(window)) throw new Error("window.relayerSDK is not available");
  const win = window as unknown as FhevmWindowType;
  const result = await win.relayerSDK.initSDK(options);
  win.relayerSDK.__initialized__ = result;
  if (!result) throw new Error("window.relayerSDK.initSDK failed.");
  return true;
};

function checkIsAddress(a: unknown): a is `0x${string}` {
  return typeof a === "string" && isAddress(a);
}

type FhevmRelayerStatusType =
  | "sdk-loading" | "sdk-loaded" | "sdk-initializing" | "sdk-initialized" | "creating";

async function getChainId(providerOrUrl: Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    return Number((await provider.getNetwork()).chainId);
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

export const createFhevmInstance = async (parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const { signal, onStatusChange, provider: providerOrUrl } = parameters;

  const throwIfAborted = () => { if (signal.aborted) throw new FhevmAbortError(); };
  const notify = (status: FhevmRelayerStatusType) => onStatusChange?.(status);

  // Resolve chainId (needed for mock detection; we skip mock path here)
  await getChainId(providerOrUrl); // validates provider connectivity
  throwIfAborted();

  if (!isFhevmWindowType(window)) {
    notify("sdk-loading");
    await fhevmLoadSDK();
    throwIfAborted();
    notify("sdk-loaded");
  }

  if (!isFhevmInitialized()) {
    notify("sdk-initializing");
    await fhevmInitSDK();
    throwIfAborted();
    notify("sdk-initialized");
  }

  const relayerSDK = (window as unknown as FhevmWindowType).relayerSDK;

  const aclAddress = relayerSDK.SepoliaConfig.aclContractAddress;
  if (!checkIsAddress(aclAddress)) {
    throwFhevmError("INVALID_ACL_ADDRESS", `Invalid ACL address: ${String(aclAddress)}`);
  }

  const pub = await publicKeyStorageGet(aclAddress as `0x${string}`);
  throwIfAborted();

  const config: FhevmInstanceConfig = {
    ...relayerSDK.SepoliaConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relayerUrl: `${(relayerSDK.SepoliaConfig as any).relayerUrl}/v2`,
    network: providerOrUrl,
    publicKey: pub.publicKey,
    publicParams: pub.publicParams,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relayerRouteVersion: 2 as any,
  };

  notify("creating");
  const instance = await relayerSDK.createInstance(config);

  // Cache the keys so the next init is faster
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await publicKeyStorageSet(aclAddress as `0x${string}`, instance.getPublicKey() as any, instance.getPublicParams(2048) as any);

  throwIfAborted();
  return instance;
};
