// Source: packages/fhevm-sdk/src/internal/RelayerSDKLoader.ts (zama-ai/dapps)
// Adapted: removed .js extensions; fixed import path for SDK_CDN_URL.
import { FhevmRelayerSDKType, FhevmWindowType } from "./fhevmTypes";
import { SDK_CDN_URL } from "./constants";

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export class RelayerSDKLoader {
  private _trace?: TraceType;

  constructor(options: { trace?: TraceType }) {
    this._trace = options.trace;
  }

  public isLoaded(): boolean {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: can only be used in the browser.");
    }
    return isFhevmWindowType(window, this._trace);
  }

  public load(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("RelayerSDKLoader: can only be used in the browser."));
    }
    if ("relayerSDK" in window) {
      if (!isFhevmRelayerSDKType((window as unknown as FhevmWindowType).relayerSDK, this._trace)) {
        throw new Error("RelayerSDKLoader: Unable to load FHEVM Relayer SDK");
      }
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
      if (existingScript) {
        if (!isFhevmWindowType(window, this._trace)) {
          reject(new Error("RelayerSDKLoader: window object does not contain a valid relayerSDK object."));
        }
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = SDK_CDN_URL;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (!isFhevmWindowType(window, this._trace)) {
          reject(new Error(`RelayerSDKLoader: Relayer SDK script loaded from ${SDK_CDN_URL} but window.relayerSDK is invalid.`));
          return;
        }
        resolve();
      };
      script.onerror = () => {
        reject(new Error(`RelayerSDKLoader: Failed to load Relayer SDK from ${SDK_CDN_URL}`));
      };
      document.head.appendChild(script);
    });
  }
}

function isFhevmRelayerSDKType(o: unknown, trace?: TraceType): o is FhevmRelayerSDKType {
  if (!o || typeof o !== "object") { trace?.("relayerSDK is not an object"); return false; }
  if (!("initSDK" in o && typeof (o as Record<string, unknown>).initSDK === "function")) { trace?.("initSDK missing"); return false; }
  if (!("createInstance" in o && typeof (o as Record<string, unknown>).createInstance === "function")) { trace?.("createInstance missing"); return false; }
  if (!("SepoliaConfig" in o && typeof (o as Record<string, unknown>).SepoliaConfig === "object")) { trace?.("SepoliaConfig missing"); return false; }
  return true;
}

export function isFhevmWindowType(win: unknown, trace?: TraceType): win is FhevmWindowType {
  if (!win || typeof win !== "object") { trace?.("window is not an object"); return false; }
  if (!("relayerSDK" in win)) { trace?.("window.relayerSDK missing"); return false; }
  return isFhevmRelayerSDKType((win as FhevmWindowType).relayerSDK, trace);
}
