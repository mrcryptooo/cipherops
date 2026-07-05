"use client";
/**
 * Runway — real Mission verification. The player pastes the transaction
 * reference from the real action they just performed in the real product;
 * this reads the actual Sepolia receipt and block via the same wagmi/viem
 * client every other page in this app already uses. Nothing here is
 * simulated — a failed or not-found lookup blocks story progression.
 *
 * If an achievement contract is deployed (NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_
 * ADDRESS is set), the player mints their own soulbound achievement NFT as
 * part of continuing — a second real transaction, same honesty rules as
 * the Mission verification itself. Until that address exists, achievements
 * are shown but stay honestly "not yet minted" — never fabricated.
 */

import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";
import { decodeEventLog, type Hash } from "viem";
import { ACHIEVEMENTS } from "@/lib/runway/achievements";
import { ACHIEVEMENT_CONTRACT_ABI, buildTokenURI, getAchievementContractAddress } from "@/lib/runway/achievement-contract";
import { RUNWAY_Y as Y, RUNWAY_YDIM as YDIM, RUNWAY_YBORDER as YBORDER, RUNWAY_CARD as CARD, RUNWAY_BORDER as BORDER, RUNWAY_GLASS_BLUR as GLASS_BLUR } from "@/lib/runway/theme";
import type { EngineId, MissionRecord } from "@/lib/runway/types";

interface MissionVerifyProps {
  missionId: string;
  missionName: string;
  feature: EngineId;
  onVerified: (record: MissionRecord) => void;
}

export function MissionVerify({ missionId, missionName, feature, onVerified }: MissionVerifyProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<MissionRecord | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  const contractAddress = getAchievementContractAddress();
  const achievement = ACHIEVEMENTS.find((a) => a.missionId === missionId);

  const { writeContract, data: mintHash, isPending: minting } = useWriteContract();
  const { data: mintReceipt, isLoading: waitingForMint } = useWaitForTransactionReceipt({ hash: mintHash });

  const isValidHash = /^0x[0-9a-fA-F]{64}$/.test(input.trim());

  async function handleVerify() {
    if (!publicClient || !isValidHash) return;
    setChecking(true);
    setError(null);
    try {
      const hash = input.trim() as Hash;
      const receipt = await publicClient.getTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        setError("That transaction is on-chain but it reverted — nothing was actually completed. Try the real one.");
        return;
      }
      const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
      const verified: MissionRecord = {
        missionId,
        missionName,
        feature,
        walletAddress: receipt.from,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        timestamp: Number(block.timestamp),
        status: "verified",
        nft: { status: "not_minted" },
      };
      setRecord(verified);
    } catch {
      setError("Couldn't find a confirmed transaction for that reference on Sepolia. Double-check it and try again.");
    } finally {
      setChecking(false);
    }
  }

  function handleMint() {
    if (!record || !achievement || !contractAddress) return;
    setMintError(null);
    const tokenURI = buildTokenURI(achievement, record.walletAddress, record.timestamp, record);
    writeContract({
      address: contractAddress,
      abi: ACHIEVEMENT_CONTRACT_ABI,
      functionName: "mintAchievement",
      args: [achievement.id, achievement.episode, tokenURI],
    });
  }

  // Once the mint transaction confirms, decode the real tokenId and continue.
  useEffect(() => {
    if (!mintReceipt || !record || !address) return;
    try {
      let tokenId: string | undefined;
      for (const log of mintReceipt.logs) {
        try {
          const decoded = decodeEventLog({ abi: ACHIEVEMENT_CONTRACT_ABI, ...log });
          if (decoded.eventName === "AchievementMinted") {
            tokenId = (decoded.args as { tokenId: bigint }).tokenId.toString();
            break;
          }
        } catch {
          // not this event, keep scanning
        }
      }
      onVerified({
        ...record,
        nft: {
          status: "minted",
          tokenId,
          owner: address,
          contractAddress: contractAddress ?? undefined,
        },
      });
    } catch {
      setMintError("Minted, but couldn't read back the token id. The transaction still succeeded.");
      onVerified({ ...record, nft: { status: "minted", owner: address, contractAddress: contractAddress ?? undefined } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintReceipt]);

  if (record) {
    const mintBusy = minting || waitingForMint;
    return (
      <div
        className="rounded-xl p-6"
        style={{ background: YDIM, border: `1px solid ${YBORDER}`, backdropFilter: GLASS_BLUR, WebkitBackdropFilter: GLASS_BLUR }}
      >
        <p className="mb-3 text-sm font-semibold" style={{ color: Y }}>Verified on-chain</p>
        <dl className="space-y-1 text-xs" style={{ color: "#ccc" }}>
          <div className="flex gap-2"><dt className="flex-shrink-0" style={{ color: "#888" }}>Tx hash</dt><dd className="truncate font-mono">{record.txHash}</dd></div>
          <div className="flex gap-2"><dt className="flex-shrink-0" style={{ color: "#888" }}>Block</dt><dd className="font-mono">{record.blockNumber}</dd></div>
          <div className="flex gap-2"><dt className="flex-shrink-0" style={{ color: "#888" }}>Wallet</dt><dd className="truncate font-mono">{record.walletAddress}</dd></div>
        </dl>
        {achievement && (
          <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${BORDER}` }}>
            <p className="text-xs font-semibold" style={{ color: Y }}>Achievement earned — {achievement.name}</p>
            <p className="mt-1 text-xs" style={{ color: "#888" }}>{achievement.description}</p>
            {!contractAddress && (
              <p className="mt-2 text-xs" style={{ color: "#555" }}>Reward NFT: not yet minted — no achievement contract deployed yet</p>
            )}
          </div>
        )}
        {mintError && <p className="mt-3 text-xs text-red-400">{mintError}</p>}
        {contractAddress && achievement && !address && (
          <p className="mt-3 text-xs" style={{ color: "#888" }}>Connect your wallet to mint this achievement — or continue and mint it later from your Career Profile.</p>
        )}
        {contractAddress && achievement && address ? (
          <button
            onClick={handleMint}
            disabled={mintBusy}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: Y, color: "#000" }}
          >
            {minting ? "Confirm in wallet…" : waitingForMint ? "Minting…" : "Mint Achievement & Continue"}
          </button>
        ) : (
          <button
            onClick={() => onVerified(record)}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: Y, color: "#000" }}
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, backdropFilter: GLASS_BLUR, WebkitBackdropFilter: GLASS_BLUR }}>
      <p className="mb-3 text-xs" style={{ color: "#888" }}>
        Paste the transaction reference from what you just did — this checks it for real, on Sepolia.
      </p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="0x… transaction hash"
        className="w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#FFD208]"
        style={{ borderColor: BORDER }}
        aria-label="Transaction hash"
      />
      <button
        onClick={() => void handleVerify()}
        disabled={!isValidHash || checking}
        className="mt-3 rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: Y, color: "#000" }}
      >
        {checking ? "Checking…" : "Verify"}
      </button>
      {address && <p className="mt-3 text-xs" style={{ color: "#555" }}>Connected: {address.slice(0, 6)}…{address.slice(-4)}</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
