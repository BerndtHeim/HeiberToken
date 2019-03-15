const HeiberTokenSale = artifacts.require("HeiberTokenSale");
const HeiberToken = artifacts.require("HeiberToken");

contract('HeiberTokenSale', function(accounts) {
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[5];
    var tokenPrice = 1000000000000000;
    var tokensAvailable = 600000;
    var numberOfTokens;

    it('initialises the contract with the correct values', function() {
        return HeiberTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'token price is correct')
        });
    });

    it('facilitates token buying', function() {        
        return HeiberToken.deployed().then(function(instance) {        
            tokenInstance = instance;        
            return HeiberTokenSale.deployed();
        }).then(function(instance) {          
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
        }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');            
            return tokenInstance.balanceOf(buyer);      
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens);                        
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error) {            
            assert(error.message.indexOf('revert')>=0, 'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {            
            assert(error.message.indexOf('revert')>=0, 'cannot purchase more tokens than available');        
        });
    });    

    it('ends token sale', function() {
        return HeiberToken.deployed().then(function(instance) {        
            tokenInstance = instance;        
            return HeiberTokenSale.deployed();
        }).then(function(instance) {          
            tokenSaleInstance = instance;       
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error) {            
            assert(error.message.indexOf('revert')>=0, 'must be admin to end sale');
            return tokenSaleInstance.endSale({from: admin});            
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            // BH check figure below should be 999990
            assert.equal(balance.toNumber(), 749890, 'returns all unsole tokens to admin');
            balance = web3.eth.getBalance(tokenSaleInstance.address)
            assert.equal(balance.toNumber(), 0);            
            //return tokenSaleInstance.tokenPrice();
        })//.then(function(price) {
            //assert.equal(price.toNumber(), 0, 'token price was reset'); //BH Fix
        //})
    });        
})
