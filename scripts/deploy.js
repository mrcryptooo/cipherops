/**
 * Deploys RunwayAchievements to Sepolia. Run with:
 *   npx hardhat run scripts/deploy.js --network sepolia
 *
 * Requires RUNWAY_DEPLOYER_PRIVATE_KEY (a funded Sepolia key) in .env.local.
 * There is no other network configured in hardhat.config.js, so this
 * script cannot be pointed at mainnet by accident.
 */
const hre = require("hardhat");

async function main() {
  const RunwayAchievements = await hre.ethers.getContractFactory("RunwayAchievements");
  const contract = await RunwayAchievements.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("RunwayAchievements deployed to Sepolia at:", address);
  console.log("Set NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS to this address in .env.local to activate minting.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
