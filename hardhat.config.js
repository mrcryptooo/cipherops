/**
 * Runway Achievements — Hardhat config. Sepolia only, on purpose: there is
 * no mainnet network defined here at all, so "deploy to mainnet" isn't a
 * command that can accidentally be run against this config.
 *
 * Deployer credentials come from RUNWAY_DEPLOYER_PRIVATE_KEY — never
 * NEXT_PUBLIC_-prefixed, since that prefix gets bundled into client-side
 * JS. This must live only in a local, gitignored .env file and never in
 * anything shipped to the browser.
 */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

const SEPOLIA_RPC_URL =
  process.env.RUNWAY_SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const DEPLOYER_PRIVATE_KEY = process.env.RUNWAY_DEPLOYER_PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
