// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract VolcanoCoin {
    uint totalSupply = 10000;
    address owner;
    
    struct Payment {
        uint amount;
        address recipient;
    }
    
    //Two way to make balances viewable externally are:
    //1. make balance a public variable
    //2. make a getter function that returns the balance of an address
    mapping(address=>uint) balance;
    mapping(address=>Payment[]) payments;
    
    event totalSupplyChange(uint);
    event tokenTransfer(uint, address);
    
    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }
    
    constructor(){
        owner = msg.sender;
        balance[owner] = totalSupply;
    }
    
    function getTotalSupply() public view returns(uint){
        return totalSupply;
    }
    
    function increaseTotalSupply() public isOwner {
        totalSupply = totalSupply + 1000;
        emit totalSupplyChange(totalSupply);
    }
    
    function getBalance(address _account) public view returns(uint) {
        return balance[_account];
    }
    
    //The sender's address is not needed as we can reference msg.sender
    //The implication of having the sender's address as an arguement is that
    //the individual calling the function is not the one transfering VolcanoCoins
    //and is doing it on someone else's behalf
    function transfer(uint _amount, address _recipient) public {
        require(balance[msg.sender] >= _amount);
        
        balance[msg.sender] = balance[msg.sender] - _amount;
        balance[_recipient] = balance[_recipient] + _amount;
        
        emit tokenTransfer(_amount, _recipient);
    }
}