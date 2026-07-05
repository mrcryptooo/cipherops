# Runway — Deploy Checklist

For an engineer picking this up cold to deploy and demo tomorrow.

## 1. Environment variables (`.env.local`)

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | All Sepolia reads/writes | Falls back to public Sepolia RPC if unset (may be rate-limited). Use PublicNode, Alchemy, or Infura for reliability. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Mobile wallet connections via QR | Injected wallets (MetaMask, Coinbase) work without it. Free at cloud.walletconnect.com. |
| `NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS` | Live achievement NFT minting | Leave empty until the contract is deployed (step 3). Game runs fully without it — achievements just stay "not yet minted." |
| `RUNWAY_DEPLOYER_PRIVATE_KEY` | Deploying the achievement contract | **Never prefix with `NEXT_PUBLIC_`** — that bundles it into client JS and leaks it to every visitor. Server/CLI use only. A funded Sepolia-only key. |
| `RUNWAY_SEPOLIA_RPC_URL` | Deploy script only | Optional — falls back to `NEXT_PUBLIC_SEPOLIA_RPC_URL`, then the public RPC. |

`NEXT_PUBLIC_MAINNET_RPC_URL` exists for the rest of CipherOps but is irrelevant to Runway —
this contract is Sepolia-only and must never be deployed to mainnet.

## 2. Wallet setup

- A MetaMask (or equivalent) wallet with Sepolia ETH. Faucets: any current public Sepolia
  faucet works.
- If deploying the achievement contract yourself, that wallet's private key goes in
  `RUNWAY_DEPLOYER_PRIVATE_KEY` — use a wallet dedicated to this purpose, not a personal one.

## 3. NFT contract deployment (one-time, optional but recommended before a live demo)

```
npm install
npx hardhat compile --force
npx hardhat run scripts/deploy.js --network sepolia
```

The script logs the deployed address. Copy it into `NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS`
in `.env.local` and restart the dev/production server. Until this is done, the game is fully
playable — achievement minting is the only thing that stays inactive, and it degrades
honestly (shown as "not yet minted," never faked).

**Do not skip this before a live demo where minting is part of the script** — without it, the
Mint buttons in `MissionVerify` and `CareerProfile` won't appear, and `DEMO_SCRIPT.md`'s
minting beats will have nothing to click.

## 4. Underlying CipherOps contracts (Registry, Operations, Airdrop, Vesting)

These are the existing, already-deployed, already-verified CipherOps engines Runway's
Missions link out to — not something this packaging pass touches or redeploys. Confirm they're
reachable at `/registry`, `/operations`, `/airdrop`, `/vesting` and that their own env vars
(RPC URLs above) are set; no separate action needed for Runway specifically.

## 5. Build commands

```
npm run typecheck   # tsc --noEmit
npm run lint         # next lint
npm run build        # next build
npm run start         # production server
```

All four must pass clean before a demo. If a production build has just run and a dev server
is also being used for last-minute checks, clear `.next` and restart the dev server fresh
afterward — this project has previously hit stale-build-cache issues when both share the same
`.next` directory.

## 6. Production verification (do this after every deploy)

- [ ] `/runway` loads with no console errors
- [ ] Office screen renders the real backdrop image (not the fallback gradient), confirming
      `runway-office-q1-base.png` is present under `/public/runway/office/`
- [ ] Connect Wallet works and shows a connected address
- [ ] Each of the 4 Mission CTAs ("Open CipherOps →") correctly navigates to
      `/registry`, `/operations`, `/airdrop`, `/vesting`
- [ ] Pasting a real, confirmed Sepolia tx hash into a Mission's verify field succeeds and
      shows the real receipt (hash, block, wallet)
- [ ] Pasting an invalid/malformed hash fails gracefully with no crash
- [ ] If `NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS` is set: minting an achievement from
      `MissionVerify` and from `CareerProfile` both succeed and show "Minted"
- [ ] "Play Q1 again" from the episode-end screen resets `sessionStorage` completely
- [ ] Career Profile's percentage/title math matches the achievements actually earned

## 7. Final QA checklist (carried over from RC1 sign-off — re-verify after any deploy)

- [ ] All 4 real Missions reachable regardless of branch taken
- [ ] All 3 finale variants reachable given their respective flag combinations
- [ ] All 14 achievements independently obtainable across some playthrough
- [ ] No storylet is permanently unreachable (dead content)
- [ ] No achievement can be earned without its underlying real condition being true
- [ ] Replay produces a genuinely fresh session (`missionLog`, `flags`, `resolved` all empty)
- [ ] Zero console errors across a full playthrough
- [ ] `tsc --noEmit`, lint, and `next build` all clean

If any box fails, do not demo until it's fixed — Episode 1 is locked content-wise, so a
failure here means an environment/deployment problem, not a gameplay one.
