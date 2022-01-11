const { expect, use } = require("chai");
const { ethers } = require("hardhat");

const { solidity } = require("ethereum-waffle");
use(solidity);

const DAIAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const uniV3RouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

describe("DeFi", () => {
  let owner;
  let DAI_TokenContract;
  let USDC_TokenContract;
  let tokenSwapInstance;
  const INITIAL_AMOUNT = 999999999000000;

  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    const whale = await ethers.getSigner(
      "0x503828976D22510aad0201ac7EC88293211D23Da"
    );
    console.log("owner account is ", owner.address);

    DAI_TokenContract = await ethers.getContractAt("ERC20", DAIAddress);
    USDC_TokenContract = await ethers.getContractAt("ERC20", USDCAddress);
    const symbol = await DAI_TokenContract.symbol();
    console.log(symbol);
    const tokenSwapContract = await ethers.getContractFactory("tokenSwap");

    await DAI_TokenContract.connect(whale).transfer(
      owner.address,
      BigInt(INITIAL_AMOUNT)
    );

    tokenSwapInstance = await tokenSwapContract.deploy(uniV3RouterAddress);
    await tokenSwapInstance.deployed();
  });

  it("should check transfer succeeded", async () => {
    let initBal = await DAI_TokenContract.balanceOf(owner.address);
    console.log(parseInt(ethers.utils.formatEther(await DAI_TokenContract.balanceOf(owner.address)) ** 18));
    expect(initBal).to.equal(INITIAL_AMOUNT);
  });

  it("should sendDAI to contract", async () => {
    await DAI_TokenContract.transfer(tokenSwapInstance.address, INITIAL_AMOUNT);
    tokenSwapBal = await DAI_TokenContract.balanceOf(tokenSwapInstance.address);
    expect(tokenSwapBal).to.equal(INITIAL_AMOUNT);
  });

  it("should make a swap", async () => {
    // let UsdcBal = await USDC_TokenContract.balanceOf(owner.address);
    // UsdcBal = ethers.utils.formatEther(UsdcBal);
    // expect(UsdcBal).to.equal(0);

    let swapTx = await tokenSwapInstance.swapExactInputSingle(INITIAL_AMOUNT, DAIAddress, USDCAddress)
    await swapTx.wait();

    UsdcBal = parseInt(ethers.utils.formatEther(await USDC_TokenContract.balanceOf(owner.address)) ** 18);
    console.log(UsdcBal);
    expect(UsdcBal).to.be.greaterThan(0);
  });
});
