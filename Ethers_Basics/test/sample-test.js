const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { solidity } = require("ethereum-waffle");
use(solidity);

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

  it("assigns initial balance to owner", async () => {
    let ownerBal = await volcanoContract.balanceOf(owner.address);
    expect(ownerBal).to.equal(100000);
  });

  it("creates the correct initial supply", async () => {
    let totalSupply = await volcanoContract.totalSupply();
    expect(totalSupply).to.equal(100000);
  })

  it("increases allowance for address1", async () => {
    let allowIncrease = 1000;
    OGallowance = await volcanoContract.allowance(owner.address, addr1.address);
    let tx = await volcanoContract.increaseAllowance(addr1.address, allowIncrease);
    await tx.wait();
    newAllowance = await volcanoContract.allowance(owner.address, addr1.address);
    let allowanceDiff = newAllowance - OGallowance;
    
    expect(allowanceDiff).to.equal(allowIncrease);
  });

  it("decreases allowance for address1", async () => {
    OGallowance = await volcanoContract.allowance(owner.address, addr1.address);
    let increaseTx = await volcanoContract.increaseAllowance(addr1.address, 1000);
    await increaseTx.wait();

    let decreaseAmount = 500;
    let decreaseTx = await volcanoContract.decreaseAllowance(addr1.address, decreaseAmount);
    await decreaseTx.wait();
    newAllowance = await volcanoContract.allowance(owner.address, addr1.address);
    
    expect(newAllowance - OGallowance).to.equal(decreaseAmount);
  });

  it("emits an event when increasing allowance", async () => {
    let allowanceTx = await volcanoContract.increaseAllowance(addr1.address, 1000);
    await allowanceTx.wait();
    await expect(allowanceTx).to.emit(volcanoContract, 'Approval');
  });

  it("reverts decreaseAllowance when sender incurs negative allowance value", async () => {
    await volcanoContract.increaseAllowance(addr1.address, 1000);
    await expectRevert(
      volcanoContract.decreaseAllowance(addr1.address, 1100),
      "ERC20: decreased allowance below zero"
    );
  });

  it("updates balances on successful transfer from owner to addr1", async () => {
    let transferVal = 40000;
    
    let senderBalOG = await volcanoContract.balanceOf(owner.address);
    let recipientBalOG = await volcanoContract.balanceOf(addr1.address);

    const transferTx = await volcanoContract.transfer(addr1.address, transferVal);
    await transferTx.wait();

    let senderBalNew = await volcanoContract.balanceOf(owner.address);
    let recipientBalNew = await volcanoContract.balanceOf(addr1.address);

    //console.log(`Balance owner: ${senderBal}\n Balance addr1:${recipientBal}`);

    expect(senderBalOG - senderBalNew).to.equal(transferVal);
    expect(recipientBalNew - recipientBalOG).to.equal(transferVal);
  });

  it("reverts transfer when sender does not have enough balance", async () => {
    await expect(
      volcanoContract.transfer(addr1.address, 110000),
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance")
  });

  it("reverts transferFrom addr1 to addr2 called by the owner without setting allowance", async () => {
    const transferTx = await volcanoContract.transfer(addr1.address, 1000);
    await transferTx.wait();

    await expectRevert(
      volcanoContract.transferFrom(addr1.address, addr2.address,1000),
      "ERC20: transfer amount exceeds allowance"
    )
  });

  it("updates balances after transferFrom addr1 to addr2 called by the owner", async () => {
    const transferTx = await volcanoContract.transfer(addr1.address, 1000);
    await transferTx.wait();

    //let allowBalTx = await volcanoContract.allowance(owner.address, addr1.address)
    //console.log(`The allowance of owner to proxy spend is: ${allowBalTx}`);

    const allowanceTx = await volcanoContract.connect(addr1).increaseAllowance(owner.address, 1000);
    await allowanceTx.wait();

    //allowBalTx = await volcanoContract.allowance(addr1.address, owner.address)
    //console.log(`The allowance of owner to proxy spend is: ${allowBalTx}`);

    const proxyTransferTx = await volcanoContract.transferFrom(addr1.address, addr2.address, 1000);
    await proxyTransferTx.wait();

    senderBal = await volcanoContract.balanceOf(addr1.address);
    recipBal = await volcanoContract.balanceOf(addr2.address);
    //console.log(`Sender:${senderBal} Recip:${recipBal}`);

    expect(senderBal).to.equal(0);
    expect(recipBal).to.equal(1000);
  });
});