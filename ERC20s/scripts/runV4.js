const { version } = require("chai");
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploying
  const initialVLC = await ethers.getContractFactory("VolcanoCoinV4");
  let instanceVLC = await upgrades.deployProxy(initialVLC, {kind: "uups"});
  await instanceVLC.deployed();

  let versionNum = await instanceVLC.getVersionNum();
  console.log(versionNum);

  // Upgrading
  const newVLC = await ethers.getContractFactory("VolcanoCoinV4_1");
  instanceVLC = await upgrades.upgradeProxy(instanceVLC.address, newVLC);

  versionNum = await instanceVLC.getVersionNum();
  console.log(versionNum);
}

async function runMain(){
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();