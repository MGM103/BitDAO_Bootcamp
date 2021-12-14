//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.0;

import "hardhat/console.sol";

//Open zeppelin libraries
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VolcanoToken is ERC721, Ownable {
    uint256 tokenID;

    struct NftMetadata {
        uint256 ID;
        uint256 timestamp;
        string URI;
    }

    mapping(address=>NftMetadata[]) record;

    constructor() ERC721("Volcano Token", "VOLT"){
        console.log("Creating my nft contract!");
    }

    function birthNFT(uint256 _tokenID) public {
        _safeMint(msg.sender, _tokenID);
        
        string memory URI = tokenURI(_tokenID);
        NftMetadata memory newTokenData = NftMetadata(_tokenID, block.timestamp, URI);
        
        console.log("Metadata:", _tokenID, block.timestamp, URI);
        record[msg.sender].push(newTokenData);

        tokenID = _tokenID + 1;
    }

    function destroyNFT(uint256 _tokenID) public {
        require(msg.sender == ownerOf(_tokenID));
        
        _burn(_tokenID);
        removeFromRecord(_tokenID);
        console.log("Token number:", _tokenID, "was burned by:", msg.sender);
    }

    function removeFromRecord(uint256 _tokenID) internal {
        uint256 metaDataSize = record[msg.sender].length;

        for(uint i = 0; i < metaDataSize; i++){
            if(record[msg.sender][i].ID == _tokenID){
                delete record[msg.sender][i];
                console.log("nft meta data record has been removed");
            }
        }
    }
}