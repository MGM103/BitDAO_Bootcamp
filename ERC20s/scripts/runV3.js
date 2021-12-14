const hre = require('hardhat');

async function main(){
    //Instatiate instance of the contract
    const [owner, user1, user2] = await hre.ethers.getSigners();
    const vlcV3ContractFactory = await hre.ethers.getContractFactory('VolcanoCoinV3');
    const vlcV3Contract = await vlcV3ContractFactory.deploy();
    await vlcV3Contract.deployed();
    
    //Print account and contract information
    console.log("\nContract was deployed to the following address:", vlcV3Contract.address);
    console.log("The owner of the contract is:", owner.address);
    console.log(`Test transactions will be done using the follwoing addresses:\n${user1.address}\n${user2.address}\n`);

    //Distribute token for test
    let transferTx = await vlcV3Contract.transfer(user1.address, 6000);
    await transferTx.wait();
    transferTx = await vlcV3Contract.transfer(user1.address, 4000);

    //Print balances
    let ownerBal = await vlcV3Contract.balanceOf(owner.address);
    let userBal = await vlcV3Contract.balanceOf(user1.address);
    console.log(`The balance of the owner is: ${ownerBal}\nThe balance of the user1 is:${userBal}\n`);

    //View payment history details
    let paymentDetails = await vlcV3Contract.viewPayments(owner.address);
    console.log(`Original Paymetn details for the Owner:\n${paymentDetails}`);

    //Make a change to the payment fields
    let updatePayment = await vlcV3Contract.updatePayment(0, 1, "Initial distribution");
    await updatePayment.wait();

    //View payment histroy to display changes
    paymentDetails = await vlcV3Contract.viewPayments(owner.address);
    console.log(`\nUpdated payment details:\n${paymentDetails}`);

    //Perform transfers using user1 to allow admin to change payments that they do not own,
    //But still have permission to update as they are the owner
    transferTx = await vlcV3Contract.connect(user1).transfer(user2.address, 2000);
    await transferTx.wait();
    transferTx = await vlcV3Contract.connect(user1).transfer(user2.address, 1000);
    await transferTx.wait();
    transferTx = await vlcV3Contract.connect(user1).transfer(user2.address, 3000);
    await transferTx.wait();

    //View payments that were just made
    paymentDetails = await vlcV3Contract.viewPayments(user1.address);
    console.log(`\nUser1 payment details:\n${paymentDetails}`);

    //Perform admin update
    let adminUpdate = await vlcV3Contract.adminPaymentUpdate(user1.address, 3, 2);
    await adminUpdate.wait();

    //Show payment history to confirm admin updates worked
    paymentDetails = await vlcV3Contract.viewPayments(user1.address);
    console.log(`\nUser1 updated payment details:\n${paymentDetails}`);
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