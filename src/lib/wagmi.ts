import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// When env vars are set they take priority.
// When they are absent, http() with no URL falls back to the chain's built-in
// public RPC (rpc.sepolia.org for Sepolia, cloudflare-eth.com for Mainnet).
// The Ankr public endpoints are NOT used as a fallback — they now require auth.
const sepoliaTransport = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
  ? http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
  : http();

const mainnetTransport = process.env.NEXT_PUBLIC_MAINNET_RPC_URL
  ? http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL)
  : http();

// NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required for WalletConnect connections
// (mobile wallets via QR code). Injected wallets (MetaMask, Coinbase Wallet,
// etc.) work fine with the dev placeholder below.
// Get a free projectId at https://cloud.walletconnect.com
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "cipherops-dev-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "CipherOps Registry",
  projectId,
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: sepoliaTransport,
    [mainnet.id]: mainnetTransport,
  },
  ssr: true,
});
