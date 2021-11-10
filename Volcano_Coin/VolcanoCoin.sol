// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract VolcanoCoin {
    uint totalSupply = 10000;
    address owner;
    
    event totalSupplyChange(uint);
    
    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }
    
    constructor(){
        owner = msg.sender;
    }
    
    function getTotalSupply() public view returns(uint){
        return totalSupply;
    }
    
    function increaseTotalSupply() public isOwner {
        totalSupply = totalSupply + 1000;
        emit totalSupplyChange(totalSupply);
    }
}