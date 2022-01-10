const { expect, use } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { solidity } = require("ethereum-waffle");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const ether = require("@openzeppelin/test-helpers/src/ether");
use(solidity);

describe("Volcano Coin V4",  () => {
  let volcanoContract;
  let owner, user1, user2, user3;

  beforeEach(async () => {
    const volcanoCoin = await ethers.getContractFactory("VolcanoCoinV4");
    
    volcanoContract = await upgrades.deployProxy(volcanoCoin, {kind: "uups"});
    [owner, user1, user2, user3] = await ethers.getSigners();
  });

  it("Returns the correct version number on deployment", async () => {
    let versionNum = 1;
    let contractVersion = await volcanoContract.getVersionNum();
    expect(contractVersion).to.equal(versionNum);
  })

  it("Upgrades correctly", async () => {
    let versionNum = 2;
    let newVolcanoCoin = await ethers.getContractFactory("VolcanoCoinV4_1");
    volcanoContract = await upgrades.upgradeProxy(volcanoContract.address, newVolcanoCoin);
    let contractVersion = await volcanoContract.getVersionNum();
    expect(contractVersion).to.equal(versionNum);
  })

  it("assigns initial balance to owner", async () => {
    let ownerBal = await volcanoContract.balanceOf(owner.address);
    expect(ownerBal).to.equal(100000);
  });

  it("Updates balances on successful transfer between owner and user1", async () => {
    let transferAmount = 25000;
    let balanceOwnerBefore = await volcanoContract.balanceOf(owner.address);
    let balanceUser1Before = await volcanoContract.balanceOf(user1.address);

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();

    let balanceOwnerAfter = await volcanoContract.balanceOf(owner.address);
    let balanceUser1After = await volcanoContract.balanceOf(user1.address);

    expect(balanceOwnerBefore - balanceOwnerAfter).to.equal(transferAmount);
    expect(balanceUser1After - balanceUser1Before).to.equal(transferAmount);
  });

  it("Creates a payment record on transfer", async () => {
    let transferAmount = 1000;

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();

    let payments = await volcanoContract.getPayments(owner.address);
    //console.log("Payments made by the owner:", payments);
    //console.log("Transaction ID:", parseInt(ethers.utils.formatEther(payments[0].paymentID)));

    expect(payments.length).to.not.equal(0);
    expect(parseInt(ethers.utils.formatEther(payments[0].paymentID))).to.equal(0);
    expect(payments[0].paymentType).to.equal(0);
    expect(payments[0].recipient).to.equal(user1.address);
    expect(parseInt(ethers.utils.formatEther(payments[0].amount)));
    expect(payments[0].comment).to.equal("");
  });

  it("Increases total supply correctly when called", async () => {
    let supplyIncrease = 50000;
    let originalSupply = await volcanoContract.totalSupply();

    let supplyTx = await volcanoContract.addToTotalSupply(supplyIncrease);
    await supplyTx.wait();

    let newSupply = await volcanoContract.totalSupply();

    expect(newSupply - originalSupply).to.equal(supplyIncrease);
  });

  it("Emits an event when total supply is increased", async () => {
    let supplyTx = await volcanoContract.addToTotalSupply(10000);
    await supplyTx.wait();
    expect(supplyTx).to.emit(volcanoContract, 'supplyChanged');
  });

  it("Returns a formatted string with full payment history", async () => {
    let transferAmount = 10000;
    let defaultTransactionType = "Unkown";
    let time1;
    let time2;
    let comment = '';

    let blockNum1 = await ethers.provider.getBlockNumber();
    time1 = await ethers.provider.getBlock(blockNum1);
    time1 = time1.timestamp + 1;

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();

    let blockNum2 = await ethers.provider.getBlockNumber();
    time2 = await ethers.provider.getBlock(blockNum2);
    time2 = time2.timestamp + 1;

    transferTx = await volcanoContract.transfer(user2.address, transferAmount);
    await transferTx.wait();

    let paymentHist = await volcanoContract.viewPayments(owner.address);
    // console.log(`Timestamp one is ${time1} and timestamp two is ${time2}`);
    // console.log(paymentHist);

    let answerString = `0\t${defaultTransactionType}\t${transferAmount}\t${time1}\t${user1.address.toLowerCase()}\t${comment}\n1\t${defaultTransactionType}\t${transferAmount}\t${time2}\t${user2.address.toLowerCase()}\t${comment}\n`;
    expect(paymentHist).to.equal(answerString);
  })

  it("Allows the user to update relevant fields of a payment", async ()=> {
    let transferAmount = 10000;
    let comment = "Alpha Leak Payment";
    let newPayType = 1;

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();

    let updateTx = await volcanoContract.updatePayment(0, newPayType, comment);
    await updateTx.wait();

    let transacHist = await volcanoContract.getPayments(owner.address);
    let transac1 = transacHist[0];

    expect(transac1.paymentType).to.equal(newPayType);
    expect(transac1.comment).to.equal(comment);
  })

  it("Reverts when given a negative payID to update", async () => {
    let transferAmount = 10000;
    let comment = "Alpha Leak Payment";
    let newPayType = 1;

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();

    await expectRevert(
      volcanoContract.updatePayment(-1, newPayType, comment),
      "value out-of-bounds"
    )
  })

  it("Allows admin to update a payment", async () => {
    let transferAmount = 10000;
    let newPayType = 3;
    let payID = 1;
    let comment = ` updated by: ${owner.address}`;

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();
    transferTx = await volcanoContract.connect(user1).transfer(user2.address, transferAmount);
    await transferTx.wait();

    let updateTx = await volcanoContract.adminPaymentUpdate(user1.address, payID, newPayType);
    await updateTx.wait();

    let paymentHist = await volcanoContract.getPayments(user1.address);
    let payment1 = paymentHist[0];

    expect(payment1.paymentType).to.equal(newPayType);
    expect(payment1.comment).to.equal(comment.toLowerCase());
  })

  it("Reverts when admin provides 0 address for payment update", async () => {
    let transferAmount = 10000;
    let newPayType = 3;
    let payID = 1;

    let transferTx = await volcanoContract.transfer(user1.address, transferAmount);
    await transferTx.wait();
    transferTx = await volcanoContract.connect(user1).transfer(user2.address, transferAmount);
    await transferTx.wait();

    await expectRevert(
      volcanoContract.adminPaymentUpdate(constants.ZERO_ADDRESS, payID, newPayType),
      "Invalid address specified"
    )
  })
});
