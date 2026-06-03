import { explorerTxUrl, shortHash, shortAddress } from "@/lib/registry";
import type { Address } from "viem";

interface VerificationDetailsProps {
  action: "Mint" | "Approve" | "Wrap";
  network: string;
  explorerBaseUrl: string;
  tokenAddress: Address;
  tokenSymbol: string;
  wrapperAddress: Address;
  wrapperSymbol: string;
  txHash: `0x${string}`;
}

export function VerificationDetails({
  action,
  network,
  explorerBaseUrl,
  tokenAddress,
  tokenSymbol,
  wrapperAddress,
  wrapperSymbol,
  txHash,
}: VerificationDetailsProps) {
  const rows: [string, React.ReactNode][] = [
    ["Action", action],
    ["Network", network],
    [
      "Underlying token",
      <a
        key="token"
        href={`${explorerBaseUrl}/address/${tokenAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono hover:underline"
        style={{ color: "#FFD208" }}
        title={tokenAddress}
      >
        {tokenSymbol} — {shortAddress(tokenAddress)}
      </a>,
    ],
    [
      "Confidential token",
      <a
        key="wrapper"
        href={`${explorerBaseUrl}/address/${wrapperAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono hover:underline"
        style={{ color: "#FFD208" }}
        title={wrapperAddress}
      >
        {wrapperSymbol} — {shortAddress(wrapperAddress)}
      </a>,
    ],
    ["Registry source", "Zama on-chain registry"],
    [
      "Transaction",
      <a
        key="tx"
        href={explorerTxUrl(explorerBaseUrl, txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono hover:underline"
        style={{ color: "#FFD208" }}
        title={txHash}
      >
        {shortHash(txHash)}
      </a>,
    ],
    [
      "Status",
      <span key="status" className="flex items-center gap-1.5 text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Confirmed
      </span>,
    ],
  ];

  return (
    <div
      className="mt-4 rounded-xl px-5 py-4"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        borderTop: "2px solid rgba(255, 210, 8, 0.35)",
        borderRight: "1px solid rgba(255, 210, 8, 0.18)",
        borderBottom: "1px solid rgba(255, 210, 8, 0.18)",
        borderLeft: "1px solid rgba(255, 210, 8, 0.18)",
      }}
    >
      <p
        className="mb-4 text-xs font-semibold uppercase"
        style={{ color: "#FFD208", letterSpacing: "0.18em" }}
      >
        Verification Details
      </p>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4"
          >
            <dt
              className="w-full flex-shrink-0 text-xs sm:w-32"
              style={{ color: "#555555" }}
            >
              {label}
            </dt>
            <dd className="min-w-0 break-all text-xs text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
