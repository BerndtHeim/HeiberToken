const HeiberToken = artifacts.require("HeiberToken");
const HeiberTokenSale = artifacts.require("HeiberTokenSale");

module.exports = function(deployer) {
  deployer.deploy(HeiberToken, 1000000).then(function() {
    var tokenPrice = 1000000000000000;    
    return deployer.deploy(HeiberTokenSale, HeiberToken.address, tokenPrice);      
  })
};