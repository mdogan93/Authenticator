// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as sigUtil } from 'eth-sig-util'
// Import our contract artifacts and turn them into usable abstractions.
import authenticator_artifacts from '../../build/contracts/Authenticator.json'

// Authenticator is our usable abstraction, which we'll use through the code below.
var Authenticator = contract(authenticator_artifacts)

window.proposeNewPreference = function () {
  let prefName = $('#preference').val()
  let period = parseInt($('#period').val())
  try {
    $('msg').html('Propose is sent to network')
    Authenticator.deployed().then(function (contractInstance) {
      contractInstance.proposeNewPreference(prefName, period, {
        from: web3.eth.accounts[0],
        gas: 300000
      })
    })
  }
  catch (err) {
    console.log(err)
  }
}
window.vote = (value) => {
  //todo send vote
};

window.logout = () => {
  window.localStorage.removeItem('logged')
  window.location = 'login.html'
}

window.signServerMsg = function () {
  let randFromServer = $('#randomStr').val()
  let msgParameters = [
    {
      type: 'string',      // Any valid solidity type
      name: 'RandomString',     // Any string label you want
      value: randFromServer  // The value to sign
    }
  ]

  var from = web3.eth.accounts[0]
  var params = [msgParameters, from]
  var method = 'eth_signTypedData'

  console.log(sigUtil.typedSignatureHash(msgParameters))

  web3.currentProvider.sendAsync({
      method, params, from
    }, function (err, result) {
      $('#addr').html('Address: ' + from)
      $('#signature').html('Signature: ' + result.result)
      console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))
    }
  )
}

window.signUp = () => {
  let values = [];
  $('.signCheck').each(function() {
    console.log($(this))
    values.push(($(this).val() === 'true'));
  });
  console.log(values);

  Authenticator.deployed().then(function (contractInstance) {
    console.log(web3.eth.accounts[0]);
      contractInstance.enroll(values,{
        from: web3.eth.accounts[0],
        gas: 300000}).then(function (obj) {
          $("#txHash").append(obj.tx)
      })
  });

  //todo send data
  //navigate
  //window.location = 'index.html'
}

window.login = () => {
  let randFromServer = $('#loginTextArea').html()
  let msgParameters = [
    {
      type: 'string',      // Any valid solidity type
      name: 'RandomString',     // Any string label you want
      value: randFromServer  // The value to sign
    }
  ]

  var from = web3.eth.accounts[0]
  var params = [msgParameters, from]
  var method = 'eth_signTypedData'

  var msgHash = (sigUtil.typedSignatureHash(msgParameters))

  web3.currentProvider.sendAsync({
      method, params, from
    }, function (err, result) {
      var passSignedMsg = result.result;
      var signedMsg = JSON.stringify(result.result);
      confirm('Hash Of the Message' + msgHash + '\n' + 'PERSONAL SIGNED:' + signedMsg);
      window.localStorage.setItem('logged', 'true');
      window.localStorage.setItem('msgHash',msgHash);
      window.localStorage.setItem('signedMsg',passSignedMsg)
      window.location = 'index.html'
    }
  );


}

window.showTime = function () {

  let hash = $('#hash').val()
  let signed = $('#signed').val()
  try {
    $('msg').html('Propose is sent to network')

    Authenticator.deployed().then(function (contractInstance) {
      return contractInstance.getAddressFromSigned.call(hash, signed).then(function (obj) {
        console.log(obj)
      })
    })
  }
  catch (err) {
    console.log(err)
  }
}

$(document).ready(function () {
  if (typeof web3 !== 'undefined') {
    console.log('Using web3 detected from external source like Metamask')
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.log('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }
  if(window.location.pathname !== '/login.html' && window.location.pathname !== '/signup.html' && !window.localStorage.getItem('logged')){
    window.location = 'login.html'
  }else if(window.location.pathname === '/login.html' && window.localStorage.getItem('logged')){
    window.location = 'index.html'
  }

  $("#loginTextArea").append(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10));

/*
  Authenticator.setProvider(web3.currentProvider)
  Authenticator.deployed().then((contractInstance) => {
    contractInstance.getCurrentProposal.call().then( (proposal) => {
      proposal.forEach( (a, index) => {
        if(typeof a === 'object'){
          $("#proposal" + index).html(a.toNumber());
        }else {
          $("#proposal" + index).html(a);
        }
      });
    });

    */

  Authenticator.setProvider(web3.currentProvider)
  Authenticator.deployed().then((contractInstance) => {
    contractInstance.getCurrentProposal.call().then( (proposal) => {
      var left_block_count = proposal[0].toNumber()+proposal[1].toNumber()- proposal[5].toNumber();
      let prefName = proposal[2];
      let upVote = proposal[3].toNumber();
      let downVote = proposal[4].toNumber();
      if(left_block_count<0) left_block_count=0;
      $("#proposal0").append(left_block_count);
      $("#proposal1").append(prefName);
      $("#proposal2").append(upVote);
      $("#proposal3").append(downVote);
    });

    var boolArr = []
    Authenticator.deployed().then((contractInstance) => {
    contractInstance.getPrefLength.call().then(length => {
      const numberLength = Number(length) ;
      if(length){
        console.log(window.localStorage.getItem('msgHash'));
        console.log(window.localStorage.getItem('signedMsg'));
        return contractInstance.getAddressFromSigned.call(window.localStorage.getItem('msgHash'), window.localStorage.getItem('signedMsg')).then(function (obj){
            for(let i = 0 ; i< length ; i++){
              (contractInstance.getUserPreference.call(obj,i).then(function(prefBool){
                contractInstance.getGlobalPreference.call(i).then(function(prefName){
                  var msg;
                  if(prefBool==true){
                    msg = " is Allowed"
                  }
                  else{
                    msg = " is Not Allowed"
                  }
                  $("#prefList").append("<p>" + prefName + "<strong>" + msg + "</strong>"  + "</p>");
                });
              }));
            }
        });

      }
    });
    console.log(boolArr);
  });



/*
    for (let i = 0; i<3; i++) {
      $("#checkArea").append('<div class="form-check">\n' +
        '            <input type="checkbox" class="form-check-input signCheck" id="check' + i + '" name="check' + i + '" value="false">\n' +
        '            <label class="form-check-label" for="check' + i + '">Check' + i + '</label>\n' +
        '        </div>');
    }

*/
Authenticator.deployed().then((contractInstance) => {
    contractInstance.getPrefLength.call().then(length => {
      console.log('length', length.toNumber());
      console.log();
      const numberLength = Number(length) ;
      if(length){
        for(let i = 0; i < numberLength ; i++){
          contractInstance.getGlobalPreference.call(i).then(globalPreference => {
            console.log(globalPreference);
                  $("#checkArea").append('<div class="form-check">\n' + '<input type="checkbox" class="form-check-input signCheck" id="check' + i + '" name="'+globalPreference+'" value="false">\n' +'<label class="form-check-label" for="check' + i + '">' + globalPreference + '</label>\n' +
        '</div>');
          })
        }
      }
    });
  });

  });
  $('body').on('change', 'input[type=\'checkbox\']', function() {
    if ($(this).is(':checked')) {
      $(this).attr('value', true);
    } else {
      $(this).attr('value', false);
    }
  });

})
