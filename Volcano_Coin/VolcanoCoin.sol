// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract VolcanoCoin {
    uint volcanoSupply = 10000;
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
    
    event TotalSupplyChange(uint);
    event Transfer(uint, address);
    
    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }
    
    constructor(){
        owner = msg.sender;
        balance[owner] = volcanoSupply;
    }
    
    function totalSupply() public view returns(uint){
        return volcanoSupply;
    }
    
    function increaseTotalSupply() public isOwner {
        volcanoSupply = volcanoSupply + 1000;
        emit TotalSupplyChange(volcanoSupply);
    }
    
    function balanceOf(address _account) public view returns(uint) {
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
        
        emit Transfer(_amount, _recipient);
    }
}