import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),

  // Tell Next.js to transpile the relayer-sdk ESM package.
  transpilePackages: ["@zama-fhe/relayer-sdk"],

  webpack(config) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = config as any;
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.fallback = {
      ...(cfg.resolve.fallback ?? {}),
      // Optional deps from MetaMask SDK and WalletConnect logger
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
      // Node-only modules referenced by @zama-fhe/relayer-sdk internals
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      worker_threads: false,
    };
    return cfg;
  },
};

export default nextConfig;
