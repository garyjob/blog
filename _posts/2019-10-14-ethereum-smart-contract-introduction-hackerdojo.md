---
layout: post
title: "Ethereum smart contract introduction - HackerDojo"
date: 2019-10-14 02:28:09
categories: ['BlockChain']
tags: []
---

### ![](https://garyteh.com/wp-content/uploads/2019/10/824E62F5-366F-4D08-B7E0-5FD7601A9AEB.jpeg)

### Library overview

The library for interacting with an Ethereum ABI
https://www.sbt-ethereum.io/tutorials/getting-started.html

An example of a smart contract
https://github.com/swaldman/eth-quip-client/issues/1

Information about the contract
https://etherscan.io/address/0x2a03eb37c0077dba0814a004bc53f2567b7587a0#code

Checking the cost of ether to gas
http://ethgasstation.info

Listing your key
*ethKeystoreList*

Creating a new wallet
*ethKeystoreWalletV3Create*

Set your default ether wallet
*ethAddressSenderDefaultSet MY_ETH_KEYSTORE
*
Override your default ether wallet
ethAddressOverride  *MY_ETH_KEYSTORE*

Importing a contract for crypto kitties
*ethContractAbiImport 0x2a03eb37c0077dba0814a004bc53f2567b7587a0*

Reading from the blockchain is free.

 	- *ethTransactionView quip getQuip 0*
 	- 
ethTransactionView cryptokitties totalSupply

Writing to the blockchain requires the creation of a transaction. Creating transactions require gas.
*ethTransactionInvoke quip addQuip "This is pretty boomz"*

Ether has a fluctuating exchange rate for gas. Paying higher gas ensures transaction gets prioritized and mined.

Sending ether to an address
*ethTransactionEtherSend MY_ETH_KEYSTORE 0.01 ether*

Checking balance in an ether wallet. Balances in all wallets are public
ethAddressBalance * MY_ETH_KEYSTORE*

To send money to your local wallet from coinbase simply send the money to that address from your own coinbase account.

Checking the balance of your contract currency (etherscan)

 	- *erc20Balance CONTRACT_NUMBER
*
 	- *for DAI: [erc20Balance 0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359](https://etherscan.io/token/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359)
*
 	- *for Ethereum Classic: [erc20Balance 0xa8c2753427b82418917b46b63718482833e579f3 ](https://etherscan.io/token/0xa8c2753427b82418917b46b63718482833e579f3)
*

creating a new coin

 	- https://github.com/swaldman/quick-and-dirty-token-overview
 	- https://github.com/OpenZeppelin/openzeppelin-contracts

### General practices

 	- use Solidity as a programming language
 	- always emit an event which generate logs that are free to read
 	- Etherscan is subjected to man in the middle attack. Important to encrypt your transactions using TLS

### Observations

The creator has generally been working on this alone and its a lonely experience. This seems to be common phenomena for creators