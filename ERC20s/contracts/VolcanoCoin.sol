// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract VolcanoCoin {
    uint256 volcanoSupply;
    address owner;
    
    struct Payment {
        uint256 amount;
        address recipient;
    }
    
    //Two way to make balances viewable externally are:
    //1. make balance a public variable
    //2. make a getter function that returns the balance of an address
    mapping(address=>uint256) balance;
    mapping(address=>Payment[]) payments;
    
    event TotalSupplyChange(uint256);
    event Transfer(uint256, address);
    
    modifier isOwner(){
        require(msg.sender == owner, "Only owners permitted");
        _;
    }
    
    constructor(){
        volcanoSupply = 10000;
        owner = msg.sender;
        balance[owner] = volcanoSupply;
    }
    
    function totalSupply() public view returns(uint256){
        return volcanoSupply;
    }
    
    function increaseTotalSupply() public isOwner {
        volcanoSupply = volcanoSupply + 1000;
        emit TotalSupplyChange(volcanoSupply);
    }
    
    function balanceOf(address _account) public view returns(uint256) {
        return balance[_account];
    }
    
    //The sender's address is not needed as we can reference msg.sender
    //The implication of having the sender's address as an arguement is that
    //the individual calling the function is not the one transfering VolcanoCoins
    //and is doing it on someone else's behalf
    function transfer(uint256 _amount, address _recipient) public {
        require(balance[msg.sender] >= _amount, "Insufficient funds");
        
        balance[msg.sender] = balance[msg.sender] - _amount;
        balance[_recipient] = balance[_recipient] + _amount;
        
        emit Transfer(_amount, _recipient);

        Payment memory payment = Payment(_amount, _recipient);
        payments[msg.sender].push(payment);
    }

    function getPayments(address _account) public view returns(Payment[] memory){
        return payments[_account];
    }
}