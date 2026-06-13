import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { formatEther, parseEther } from "ethers";

const deployFullSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log(`Network: ${network.name}`);
  log(`Deployer: ${deployer}`);

  const deployerBalance = await ethers.provider.getBalance(deployer);
  log(`Deployer balance: ${formatEther(deployerBalance)} ETH`);

  if (deployerBalance < parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment, need at least 0.01 ETH");
  }

  log("\n1) Deploy AccessControl (UUPS proxy)");
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

  log("\n2) Deploy AddressRegistry (UUPS proxy)");
  const addressRegistry = await deploy("AddressRegistry", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [accessControl.address],
        },
      },
    },
  });

  log("\n3) Deploy taskData (UUPS proxy)");
  const taskData = await deploy("taskData", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [addressRegistry.address],
        },
      },
    },
  });

  log("\n4) Deploy UsersContract (UUPS proxy)");
  const usersContract = await deploy("UsersContract", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [addressRegistry.address],
        },
      },
    },
  });

  log("\n5) Deploy System_wallet (UUPS proxy)");
  const systemWallet = await deploy("System_wallet", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [addressRegistry.address],
        },
      },
    },
  });

  log("\n6) Deploy dataContract (regular contract)");
  const dataContract = await deploy("dataContract", {
    from: deployer,
    log: true,
    args: [
      // Weight Percentages
      40, // rewardScore
      30, // reputationScore
      20, // deadlineScore
      10, // revisionScore
      // Reputation Points
      10, // cancelByMeRP
      10, // revisionRP
      20, // taskAcceptCreatorRP
      20, // taskAcceptMemberRP
      15, // deadlineHitCreatorRP
      15, // deadlineHitMemberRP
      // State Variables
      10, // maxStakeInEther
      10, // maxRewardInEther
      24, // minRevisionTimeInHour
      10, // negPenalty
      5, // feePercentage
      3, // maxRevision
      // Project Categories
      1, // lowCategory
      2, // middleLowCategory
      3, // middleCategory
      4, // middleHighCategory
      5, // highCategory
      10, // ultraHighCategory
      // Stake Utils
      20, // memberStakePercentageFromReward
      20, // creatorStakePercentageFromProjectValue
      // Address Registry
      addressRegistry.address,
    ],
  });

  
  //task modules

  log("\n7) Deploy TaskLifecycleLogic");
  const taskLifecycleLogic = await deploy("TaskLifecycleLogic", {
    from: deployer,
    log: true,
    args: [addressRegistry.address],
  });

  log("\n8) Deploy SubmissionLogic");
  const submissionLogic = await deploy("SubmissionLogic", {
    from: deployer,
    log: true,
    args: [addressRegistry.address],
  });

  log("\n9) Deploy JoinRequestLogic");
  const joinRequestLogic = await deploy("JoinRequestLogic", {
    from: deployer,
    log: true,
    args: [addressRegistry.address],
  });

  log("\n10) Deploy CancellationLogic");
  const cancellationLogic = await deploy("CancellationLogic", {
    from: deployer,
    log: true,
    args: [addressRegistry.address],
  });

  log("\n11) Deploy TaskController (UUPS proxy)");
  const taskController = await deploy("TaskController", {
    from: deployer,
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [addressRegistry.address],
        },
      },
    },
  });

  log("\n12) Configure AddressRegistry");
  const addressRegistryContract = (await ethers.getContract("AddressRegistry", deployer)) as any;

  await addressRegistryContract.____secondInitialization(
    usersContract.address,
    systemWallet.address,
    dataContract.address,

    // task components
    taskData.address,
    cancellationLogic.address,
    joinRequestLogic.address,
    submissionLogic.address,
    taskLifecycleLogic.address,
    taskController.address,
    { gasLimit: 15000000 },
  );

  log("\n✅ Full task system deployed and registry configured successfully.");
  log(`AccessControl: ${accessControl.address}`);
  log(`AddressRegistry: ${addressRegistry.address}`);
  log(`System_wallet: ${systemWallet.address}`);
  log(`taskData: ${taskData.address}`);
  log(`UsersContract: ${usersContract.address}`);
  log(`dataContract: ${dataContract.address}`);
  log(`TaskLifecycleLogic: ${taskLifecycleLogic.address}`);
  log(`SubmissionLogic: ${submissionLogic.address}`);
  log(`JoinRequestLogic: ${joinRequestLogic.address}`);
  log(`CancellationLogic: ${cancellationLogic.address}`);
  log(`TaskController: ${taskController.address}`);
};

export default deployFullSystem;
deployFullSystem.tags = ["FullSystem"];
