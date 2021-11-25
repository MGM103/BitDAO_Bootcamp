// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/access/Ownable.sol";

contract VolcanoCoin is ERC20("Volcano Coin", "VOL"), Ownable() {

    uint initialSupply = 10000;
    
    struct Payment {
        uint amount;
        address recipient;
    }
    
    mapping(address=>Payment[]) public payments;
    
    event TotalSupplyChange(uint);
    
    constructor(){
        _mint(msg.sender, initialSupply);
    }
    
    function mintMoreVol(uint _amount) public onlyOwner {
        _mint(msg.sender, _amount);
        emit TotalSupplyChange(totalSupply());
    }
    
    function transfer(address _recipient, uint _amount) public virtual override returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        _logPayment(msg.sender, _recipient, _amount);
        return true;
    }
    
    function _logPayment(address _sender, address _recipient, uint _amount) private {
        Payment memory newPayment = Payment(_amount, _recipient);
        payments[_sender].push(newPayment);
    }
}