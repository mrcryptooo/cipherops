"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { shortAddress } from "@/lib/registry";

export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return (
            <div
              aria-hidden
              className="h-8 w-32 animate-pulse rounded-lg bg-zinc-800"
            />
          );
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-400/60"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Wrong Network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
              title="Switch network"
            >
              {chain.hasIcon && chain.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={chain.iconUrl} alt={chain.name ?? "chain"} className="h-3.5 w-3.5 rounded-full" />
              )}
              <span>{chain.name}</span>
            </button>
            <button
              onClick={openAccountModal}
              className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-500"
              title="Account details"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FFD208" }} />
              {shortAddress(account.address)}
              {account.displayBalance && (
                <span className="ml-1 text-zinc-500">({account.displayBalance})</span>
              )}
            </button>
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
