# Hardhat Token Tax Project

This project demonstrates a simple Hardhat project that simulates token buy and sell transactions to perform tax calculations.

## Prerequisites

Have a fork of the network you want to test on using developer tools. Anvil by Foundry is a good option.

## Running the Project

If using Anvil, start the local network with:

```sh
anvil --fork-url [RPC_URL] --fork-block-number [BLOCK_NUMBER] --fork-chain-id [CHAIN_ID] --chain-id [CHAIN_ID]
```

Run the simulation scripts

```sh
npm run simulate-buy
npm run simulate-sell
```
