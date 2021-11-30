const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

//https://www.chaijs.com/guide/styles/

//https://docs.openzeppelin.com/test-helpers/0.5/

describe("Volcano Coin", () => {
  let volcanoContract;
  let owner, addr1, addr2, addr3;

  beforeEach(async () => {
    const Volcano = await ethers.getContractFactory("VolcanoCoin");
    volcanoContract = await Volcano.deploy();
    await volcanoContract.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  it("has a name", async () => {
    let contractName = await volcanoContract.name();
    expect(contractName).to.equal("Volcano Coin");
  });

  it("reverts when transferring tokens to the zero address", async () => {
    await expectRevert(
      volcanoContract.transfer(constants.ZERO_ADDRESS, 10),
      "ERC20: transfer to the zero address"
    );
  });

  //homework
  it("has a symbol", async () => {
    let symbol = await volcanoContract.symbol();
    expect(symbol).to.equal("VLC");
  });

  it("has 18 decimals", async () => {
    let numDecimals = await volcanoContract.decimals();
    expect(numDecimals).to.equal(18);
  });

  it("assigns initial balance", async () => {
    let ownerBal = await volcanoContract.balanceOf(owner.address);
    expect(ownerBal).to.equal(100000);
  });

  it("increases allowance for address1", async () => {
    let increaseAllowance = await volcanoContract.increaseAllowance(owner.address, 1000);
    console.log(increaseAllowance);
    // expect(increaseAllowance).to.equal(true);
  });

  it("decreases allowance for address1", async () => {});
  it("emits an event when increasing allowance", async () => {});
  it("revets increaseAllowance when sender does not have enough balance", async () => {});

  it("updates balances on successful transfer from owner to addr1", async () => {});
  it("revets transfer when sender does not have enough balance", async () => {});

  it("reverts transferFrom addr1 to addr2 called by the owner without setting allowance", async () => {});
  it("updates balances after transferFrom addr1 to addr2 called by the owner", async () => {});
});