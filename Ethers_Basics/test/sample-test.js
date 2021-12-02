const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;
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
    //let allowance = await volcanoContract.allowance(owner.address, addr1.address);
    //console.log(`Address of the owner contract is: ${owner.address} \n Allowance is for address: ${addr1.address} \n The allowance of this address is: ${allowance}`);
    await volcanoContract.increaseAllowance(addr1.address, 1000);
    allowance = await volcanoContract.allowance(owner.address, addr1.address);
    //console.log(`Address of the owner contract is: ${owner.address} \n Allowance is for address: ${addr1.address} \n The allowance of this address is: ${allowance}`);
    
    expect(allowance).to.equal(1000);
  });

  it("decreases allowance for address1", async () => {
    await volcanoContract.increaseAllowance(addr1.address, 1000);
    await volcanoContract.decreaseAllowance(addr1.address, 500);
    allowance = await volcanoContract.allowance(owner.address, addr1.address);
    
    expect(allowance).to.equal(500);
  });

  xit("emits an event when increasing allowance", async () => {
    let allowanceTx = await volcanoContract.increaseAllowance(addr1.address, 1000);
    let eventReceipt = await allowanceTx.wait();
    await expectEvent(eventReceipt, 'Approval');
    //{owner: owner.address, spender: addr1.address, value: 1000}
  });

  it("reverts decreaseAllowance when sender incurs negative allowance value", async () => {
    await volcanoContract.increaseAllowance(addr1.address, 1000);
    await expectRevert(
      volcanoContract.decreaseAllowance(addr1.address, 1100),
      "ERC20: decreased allowance below zero"
    );
  });

  it("updates balances on successful transfer from owner to addr1", async () => {
    // let senderBal = await volcanoContract.balanceOf(owner.address);
    // let recipientBal = await volcanoContract.balanceOf(addr1.address);
    // console.log(`Balance owner: ${senderBal}\n Balance addr1:${recipientBal}`);
    
    const transferTx = await volcanoContract.transfer(addr1.address, 50000);
    await transferTx.wait();
    let senderBal = await volcanoContract.balanceOf(owner.address);
    let recipientBal = await volcanoContract.balanceOf(addr1.address);

    //console.log(`Balance owner: ${senderBal}\n Balance addr1:${recipientBal}`);

    expect(senderBal).to.equal(50000);
    expect(recipientBal).to.equal(50000);
  });

  it("reverts transfer when sender does not have enough balance", async () => {
    await expectRevert(
      volcanoContract.transfer(addr1.address, 110000),
      "ERC20: transfer amount exceeds balance"
    )
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

    let allowBalTx = await volcanoContract.allowance(owner.address, addr1.address)
    console.log(`The allowance of owner to proxy spend is: ${allowBalTx}`);

    const allowanceTx = await volcanoContract.connect(addr1).increaseAllowance(owner.address, 1000);
    await allowanceTx.wait();

    allowBalTx = await volcanoContract.allowance(addr1.address, owner.address)
    console.log(`The allowance of owner to proxy spend is: ${allowBalTx}`);

    const proxyTransferTx = await volcanoContract.transferFrom(addr1.address, addr2.address, 1000);
    await proxyTransferTx.wait();

    senderBal = await volcanoContract.balanceOf(addr1.address);
    recipBal = await volcanoContract.balanceOf(addr2.address);
    console.log(`Sender:${senderBal} Recip:${recipBal}`);

    expect(senderBal).to.equal(0);
    expect(recipBal).to.equal(1000);
  });
});