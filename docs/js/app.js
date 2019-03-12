App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 600000,

   init: function() {
       console.log("App initialised...")
       return App.initWeb3();
   },

   initWeb3: function() {
       if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
       } else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
       }

       return App.initContracts();
   },

   initContracts: function() {
        $.getJSON("HeiberTokenSale.json", function(heiberTokenSale) {
            App.contracts.HeiberTokenSale = TruffleContract(heiberTokenSale);
            App.contracts.HeiberTokenSale.setProvider(App.web3Provider);
            App.contracts.HeiberTokenSale.deployed().then(function(heiberTokenSale) {            
                console.log("Heiber Token Sale Address:", heiberTokenSale.address);
            })
        }).done(function() {
            $.getJSON("HeiberToken.json", function(heiberToken) {
                App.contracts.HeiberToken = TruffleContract(heiberToken);
                App.contracts.HeiberToken.setProvider(App.web3Provider);
                App.contracts.HeiberToken.deployed().then(function(heiberToken) {            
                    console.log("Heiber Token Address:", heiberToken.address);
                })  
                
                App.listenForEvents();                
                return App.render();
            })
        })
   },

   listenForEvents: function() {
    App.contracts.HeiberTokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
            fromBlock: 0,
            toBlock: 'latest',
        }).watch(function(error, event) {
            console.log('even triggered', event);
            App.render();
        })
    })        
   },

   render: function() {
       if (App.loading) {
            return;
       }
       App.loading = true;

       var loader = $('#loader');
       var content = $('#content');

       loader.show();
       content.hide();

       web3.eth.getCoinbase(function(err, account) {
            if (err == null) {
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
       })

       App.contracts.HeiberTokenSale.deployed().then(function(instance) {
            heiberTokenSaleInstance = instance;
            return heiberTokenSaleInstance.tokenPrice();
       }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice.toNumber();    
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
            return heiberTokenSaleInstance.tokensSold();
       }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);    
            
            var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            App.contracts.HeiberToken.deployed().then(function(instance) {
                heiberTokenInstance = instance;
                return heiberTokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.heiber-balance').html(balance.toNumber());        

                App.loading = false;
                loader.hide();
                content.show();                    
            });
        }); 
   },

   buyTokens: function() {
    $('#content').hide();
    $('#loader').show();

    var numberOfTokens = $('#numberOfTokens').val();
    console.log(numberOfTokens);

    App.contracts.HeiberTokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
            from: App.account,
            value: numberOfTokens * App.tokenPrice,
            gas: 500000
        });
    }).then(function(result) {
        console.log('Tokens bought...');
        $('form').trigger('reset');
    });
   }
}

$(function() {
    //$(window).load(function() {
      //  App.init();
    //})
    $(document).ready(function() {
        App.init();
    })
});