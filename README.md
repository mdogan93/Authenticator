# Authenticator

If you have metamask plugin, you can directly clone the project and start to play with executing following command in project's repository.
  
  ```npm run dev``` 

The smart contract is deployed to Rinkeby network and its adress is : 0xa70e235c0449bc7209edf85ff5c450565b50a8f3

If you don't have metamask, you can still run it locally from node console.
First you need to start ganache-cli test network which provides 10 test accounts to interact with Ethereum.   
```node_modules/.bin/ganache-cli```   
Start node console    
```node```   
Then execute the commands respectively,

``` > Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
> code = fs.readFileSync('Authenticator.sol').toString()
> solc = require('solc')
> compiledCode = solc.compile(code)
> abiDefinition = JSON.parse(compiledCode.contracts[':Authenticator'].interface)
> AuthenticatorContract = web3.eth.contract(abiDefinition)
> byteCode = compiledCode.contracts[':Authenticator'].bytecode
> deployedContract = AuthenticatorContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
> deployedContract.address
> contractInstance = AuthenticatorContract.at(deployedContract.address)
```
