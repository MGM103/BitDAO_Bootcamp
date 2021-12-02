// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

//get default provider quiries trusted nodes like etherscan, alchemy and infura
//const provider = new ethers.providers.getDefaultProvider('rinkeby');
const provider = new ethers.providers.WebSocketProvider('ws://127.0.0.1:8545');

//This function views basic information from the provider
async function basicProvider() {
  let blockNumber = await provider.getBlockNumber();
  console.log("Block number:", blockNumber);

  //get balance of the following address
  let balance = await provider.getBalance("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
  balance = ethers.utils.formatEther(balance);
  console.log("Balance is:", balance);

  //get current block number of the chain
  let block = await provider.getBlock(blockNumber-1);
  console.log(block);
}

//Singers are accounts that have access to a private key be it directly or indirectly and 
//can therefore sign messages and transactions to the network using your account. Whereas as 
//providers provide a connection to the network to view the status of the block chain, they are read-only

//This line gives the wallet with the private key to make transactions for this account 
//using the network access provided by the provider
let myWallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
//the following line is not strictly necessary as provider is specified whent wallet is initialised,
//however you can use either method to achieve the connection
myWallet = myWallet
  .connect(provider);

let anonWallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

async function sendTx() {
  let myAddr = await myWallet.getAddress();
  console.log("My address is:", myAddr);

  let myBal = await myWallet.getBalance();
  myBal = await ethers.utils.formatEther(myBal);
  console.log("The balance is:", myBal);

  //This returns information before the transaction is sent
  //Transfering eth
  let txResponse = await myWallet.sendTransaction({
    to: anonWallet.address,
    //value is default in wei, can use utils to help
    value: ethers.utils.parseEther("100"),
  })

  console.log("Transaction hash:", txResponse.hash);

  //Wait for transaction to be mined
  let txReceipt = await txResponse.wait();
  console.log("Tx receipt is:", txReceipt);
}

async function deployContract() {
  //The first step in deploying a contract, 
  //a factory is an abstraction to create instances of a smartcontract
  const volcanoContractFactory = await ethers.getContractFactory("VolcanoCoin", myWallet);

  //Like sending a trasaxtion, deploying a contract doesn't mean you have deployed.
  //You need to wait for it to be mined, or in this case deployed()
  //constructor params go inside the deploy() function
  //The deploy function actually deploys the contract instance produced by the factory
  const volcanoContract = await volcanoContractFactory.deploy();
  await volcanoContract.deployed();
  console.log("Contract address is:", volcanoContract.address);
}

async function playwContract() {
  const contractAddr = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

  //Name is the name from the ABI
  const volcanoContract = await ethers.getContractAt("VolcanoCoin", contractAddr, myWallet);

  let name = await volcanoContract.name();
  console.log("Contract name is:", name);

  let ownerBalance = await volcanoContract.balanceOf(myWallet.address);
  let recipientBalance = await volcanoContract.balanceOf(anonWallet.address);
  console.log(`Balance of owner is ${ownerBalance} and the balance of the recipient is: ${recipientBalance}`);

  //perform transfer
  let transferTx = await volcanoContract.transfer(anonWallet.address, 6900);
  await transferTx.wait();

  ownerBalance = await volcanoContract.balanceOf(myWallet.address);
  recipientBalance = await volcanoContract.balanceOf(anonWallet.address);
  console.log(`Balance of owner is ${ownerBalance} and the balance of the recipient is: ${recipientBalance}`);

  //connect needed to change the singer from the deployer of the contract
  let refundTx = await volcanoContract.connect(anonWallet).transfer(myWallet.address, 3600);
  await refundTx.wait();

  ownerBalance = await volcanoContract.balanceOf(myWallet.address);
  recipientBalance = await volcanoContract.balanceOf(anonWallet.address);
  console.log(`After refund, balance of owner is ${ownerBalance} and the balance of the recipient is: ${recipientBalance}`);
}


//basicProvider()
//sendTx()
//deployContract()
playwContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
