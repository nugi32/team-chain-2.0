import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { parseEther, formatEther } from "ethers";

const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  // ================= PRE-FLIGHT =================
  const deployerBalance = await ethers.provider.getBalance(deployer);
  log(`Deployer: ${deployer} — balance: ${formatEther(deployerBalance)} ETH`);

  if (deployerBalance < parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment");
  }

  log("Starting deployment sequence...");

  // ======================================================
  // 1) AccessControl — UUPS PROXY
  // ======================================================
  log("Deploying AccessControl (UUPS proxy)...");

  const accessControl = await deploy("AccessControl", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
    },
  });

  const accessControlAddress = accessControl.address;
  log(`AccessControl proxy: ${accessControlAddress}`);

  // ======================================================
  // 2) System_wallet — UUPS PROXY
  // ======================================================
  log("Deploying System_wallet (UUPS proxy)...");

  const systemWallet = await deploy("System_wallet", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [accessControlAddress],
        },
      },
    },
  });

  const systemWalletAddress = systemWallet.address;
  log(`System_wallet proxy: ${systemWalletAddress}`);

  // ======================================================
  // 3) stateVariable — NORMAL CONTRACT
  // ======================================================
  log("Deploying stateVariable (regular contract)...");

  const stateVariable = await deploy("stateVariable", {
    from: deployer,
    log: true,
    args: [
      // Weight
      40, 30, 20, 10,
      // Stake
      1, 2, 3, 4, 5, 10,
      // Reputation
      10, 5, 5, 2, 20, 20,
      // State vars
      10, 10, 24, 10, 5, 3,
      // Categories
      1, 2, 3, 4, 5, 10,
      // AccessControl
      accessControlAddress,
    ],
  });

  const stateVarAddress = stateVariable.address;
  log(`stateVariable deployed: ${stateVarAddress}`);

  // ======================================================
  // 4) TrustlessTeamProtocol — UUPS PROXY
  // ======================================================
  log("Deploying TrustlessTeamProtocol (UUPS proxy)...");

  const trustlessTeamProtocol = await deploy("TrustlessTeamProtocol", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            accessControlAddress,
            systemWalletAddress,
            stateVarAddress,
            50, // initialMemberStakePercent
          ],
        },
      },
    },
  });

  log(`TrustlessTeamProtocol proxy: ${trustlessTeamProtocol.address}`);
  log("✅ Deployment completed");
};

export default deployYourContract;
deployYourContract.tags = ["YourContract"];
