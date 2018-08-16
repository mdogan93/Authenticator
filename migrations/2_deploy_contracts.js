var Authenticator = artifacts.require("./Authenticator.sol");

module.exports = function(deployer) {
  deployer.deploy(Authenticator,{gas:3000000});

};
