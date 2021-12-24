// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VolcanoCoinV3 is ERC20("Volcano Coin", "VLC"), Ownable {

    uint256  constant initialSupply = 100000;
    address admin;
    
    using Counters for Counters.Counter;
    Counters.Counter private _paymentIDs;

    using Strings for uint256;

    struct Payment{
        uint256 paymentID;
        PaymentTypes paymentType;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        string comment;
    }

    enum PaymentTypes {Unkown, BasicPayment, Refund, Dividend, GroupPayment}
    PaymentTypes constant defaultChoice = PaymentTypes.Unkown;

    mapping (address => Payment[]) public payments;
    event supplyChanged(uint256);

    modifier isAdmin(){
        require(msg.sender == admin);
        _;
    }

    constructor() {
        _mint(msg.sender, initialSupply);
        admin = msg.sender;
    }

    function transfer(address _recipient, uint _amount) public virtual override returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        addPaymentRecord(msg.sender, _recipient, _amount);
        return true;
    }

    function addPaymentRecord(address _sender, address _recipient, uint _amount) internal {
        payments[_sender].push(
            Payment(_paymentIDs.current(), PaymentTypes.Unkown, _amount,_recipient, block.timestamp, "")
        );
        _paymentIDs.increment();
    }

    function addToTotalSupply(uint256 _quantity) public onlyOwner {
        _mint(msg.sender,_quantity);
        emit supplyChanged(_quantity);
    }

    function getPayments(address _user) public view returns (Payment[] memory) {
        return payments[_user];
    }

    function viewPayments(address _user) public view returns (string memory) {
        string memory paymentInfo = "";
        string memory currentInfo;
        Payment[] memory userPayments = payments[_user];

        for(uint256 i = 0; i < userPayments.length; i++){
            currentInfo = string(abi.encodePacked(
                Strings.toString(userPayments[i].paymentID), "\t", 
                paymentType2String(userPayments[i].paymentType), "\t", 
                Strings.toString(userPayments[i].amount), "\t", 
                Strings.toString(userPayments[i].timestamp), "\t", 
                "0x", toAsciiString(userPayments[i].recipient), "\t", 
                userPayments[i].comment, "\n"
            ));
            paymentInfo = string(abi.encodePacked(paymentInfo, currentInfo));
        }

        return paymentInfo;
    }

    //Assumes that the user that made a payment and the admin are the only ones able to update it
    function updatePayment(uint256 _payID, PaymentTypes _paymentType, string calldata _comment) public {
        //Not sure about require for enum
        //require(_comment); not sure about verifying string either

        for(uint256 i = 0; i < payments[msg.sender].length; i++){
            if(payments[msg.sender][i].paymentID == _payID){
                payments[msg.sender][i].paymentType = _paymentType;
                payments[msg.sender][i].comment = _comment;
            }
        }
    }

    function adminPaymentUpdate(address _user, uint256 _payID, PaymentTypes _paymentType) public isAdmin {
        require(_user != address(0), "Invalid address specified");
        //Not sure about require for enum
        //require(_comment); not sure about verifying string either

        for(uint256 i = 0; i < payments[_user].length; i++){
            if(payments[_user][i].paymentID == _payID){
                payments[_user][i].paymentType = _paymentType;
                payments[_user][i].comment = string(abi.encodePacked(
                    payments[_user][i].comment,
                    " updated by: 0x", 
                    toAsciiString(msg.sender)
                ));
            }
        }
    }

    function paymentType2String(PaymentTypes _paymentType) internal pure returns(string memory) {
        string memory retVal;

        if(_paymentType == PaymentTypes.Unkown){
            retVal = "Unkown";
        }else if(_paymentType == PaymentTypes.BasicPayment){
            retVal = "Basic Payment";
        }else if(_paymentType == PaymentTypes.Refund){
            retVal = "Refund";
        }else if(_paymentType == PaymentTypes.Dividend){
            retVal = "Dividend";
        }else{
            retVal = "Group Payment";
        }

        return retVal;
    }

    //The following two functions were borrowed for address to string conversion from eth stack exchange
    function toAsciiString(address _x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(_x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}