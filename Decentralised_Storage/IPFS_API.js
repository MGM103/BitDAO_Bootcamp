const IPFS = require('ipfs');
const all = require('it-all');

async function main(){
    const node = IPFS.create();
    const data = "Hello, my name is Nelli";

    const cid = await node.add(data);

    const retrievedData = Buffer.concat(await all(node.cat(cid.path)));

    console.log(cid.path);
    console.log(retrievedData.toString());
}

// const ipfsAPI = {
//     async ipfsInit(){
//         try{
//             const node = await IPFS.create();
//             console.log('Node initiallised');
//             return node;
//         }catch(error){
//             console.log(error);
//         }
//     },
//     async ipfsAdd(data){
//         try{
//             return await node.add(data);
//         }catch(error){
//             console.log(error)
//         }
//     },
//     async ipfsGet(CID){
//         try{
//             const data = Buffer.concat(await all(node.cat(CID)));
//             return data;
//         }catch (error){
//             console.log(error);
//         }
//     }
// }

main();