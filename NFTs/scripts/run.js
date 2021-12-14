const main = async () => {
    const volcanoTokenFactory = await hre.ethers.getContractFactory("VolcanoToken");
    const volcanoTokenContract = await volcanoTokenFactory.deploy();
    let nftID = 0;

    await volcanoTokenContract.deployed();

    console.log("Nft contract has been deployed to following address:", volcanoTokenContract.address);

    let txn = await volcanoTokenContract.birthNFT(nftID);
    await txn.wait();
    nftID++;
    console.log("First NFT minted");

    txn = await volcanoTokenContract.birthNFT(nftID);
    await txn.wait();
    console.log("Second NFT minted");

    txn = await volcanoTokenContract.destroyNFT(nftID);
    await txn.wait();
    console.log("NFT #%i was destroyed", nftID);
    nftID--;
}

const runMain = async () => {
    try{
       await main();
       process.exit(0);
    }catch (error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();