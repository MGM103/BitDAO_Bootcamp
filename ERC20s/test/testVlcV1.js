const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { solidity } = require("ethereum-waffle");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
use(solidity);

describe("Volcano Coin", () => {
    let volcanoContract;
    let owner, user1;

    beforeEach(async () => {
        const volcanoContractFactory = await ethers.getContractFactory("VolcanoCoin");
        volcanoContract = await volcanoContractFactory.deploy();
        await volcanoContract.deployed();

        [owner, user1] = await ethers.getSigners();
    })

    it("Assigns initial supply to the owner", async () => {
        let expectedTotalSupply = 10000;

        let ownerBal = await volcanoContract.balanceOf(owner.address);
        let totalSupply = await volcanoContract.totalSupply();

        expect(ownerBal).to.equal(expectedTotalSupply);
        expect(totalSupply).to.equal(expectedTotalSupply);
    })

    it("Increases total supply correctly", async () => {
        let expectedTotalSupply = 11000;

        let increaseSupplyTx = await volcanoContract.increaseTotalSupply();
        await increaseSupplyTx.wait();

        let totalSupply = await volcanoContract.totalSupply();

        expect(totalSupply).to.equal(expectedTotalSupply);
    })

    it("Emits an event when total supply is increased", async () => {
        let increaseSupplyTx = await volcanoContract.increaseTotalSupply();
        await increaseSupplyTx.wait();

        expect(increaseSupplyTx).to.emit(volcanoContract, 'TotalSupplyChange');
    })

    it("Updates balances correctly after a transfer", async () => {
        let transferAmount = 4000;
        let ownerBalBefore = await volcanoContract.balanceOf(owner.address);
        let userBalBefore = await volcanoContract.balanceOf(user1.address);

        let transferTx = await volcanoContract.transfer(transferAmount, user1.address);
        await transferTx.wait();

        let ownerBalAfter = await volcanoContract.balanceOf(owner.address);
        let userBalAfter = await volcanoContract.balanceOf(user1.address);        

        expect(ownerBalBefore - ownerBalAfter).to.equal(transferAmount);
        expect(userBalAfter - userBalBefore).to.equal(transferAmount);
    })

    it("Reverts a payment if sender has insufficient funds", async () => {
        let transferAmount = 10001;

        await expectRevert(
            volcanoContract.transfer(transferAmount, user1.address),
            "Insufficient funds"
        );
    })

    it("Emits an event when a transfer is performed", async () => {
        let transferAmount = 4000;

        let transferTx = await volcanoContract.transfer(transferAmount, user1.address);
        await transferTx.wait();

        expect(transferTx).to.emit(volcanoContract, 'Transfer');
    })

    it("Creates a payment record reflecting the transfer details", async () => {
        let transferAmount = 4000;

        let transferTx = await volcanoContract.transfer(transferAmount, user1.address);
        await transferTx.wait();

        let paymentHistory = await volcanoContract.getPayments(owner.address);
        let transac1 = paymentHistory[0];

        console.log(transac1.amount);

        //expect(transac1.amount).to.equal({bigNumber: transferAmount});
        expect(transac1.recipient).to.equal(user1.address);
    })
})