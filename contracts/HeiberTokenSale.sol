pragma solidity ^0.5.0;

import "./HeiberToken.sol";

contract HeiberTokenSale {
    address payable admin;
    HeiberToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(HeiberToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }    

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require (y == 0 || (z = x * y) / y == x, "");        
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice), "token price must be correct");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, "contract needs enough tokens");
        require(tokenContract.transfer(msg.sender, _numberOfTokens), "transfer");

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }    

    function endSale() public {
        require(msg.sender == admin, "must be an admin");
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))), "transfer balance back to admin");

        selfdestruct(admin); // BH fix
    }
}
