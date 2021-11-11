//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0; //better to use a fixed version in production

contract IsOwner{
    address owner;
    
    constructor(){
        owner = msg.sender;
    }
}