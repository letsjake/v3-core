import { ethers, network } from 'hardhat'
import { ContractFactory } from 'ethers'
import fs from 'fs'
import * as dotenv from 'dotenv'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  UniswapV3Factory: require('../artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'),
  UniswapV3PoolDeployer: require('../artifacts/contracts/UniswapV3PoolDeployer.sol/UniswapV3PoolDeployer.json'),
}

if (!process.env.DEPLOYER_KEY) {
  throw new Error("Please set your DEPLOYER_KEY in a .env file");
}

async function main() {
  const deployer = new ethers.Wallet(
    process.env.DEPLOYER_KEY,
    ethers.provider
  );
  const networkName = network.name
  console.log('Deploying contracts with account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // UniswapV3Factory
  let uniswapV3Factory_address = ''
  let uniswapV3Factory
  if (!uniswapV3Factory_address) {
    const UniswapV3Factory = new ContractFactory(
      artifacts.UniswapV3Factory.abi,
      artifacts.UniswapV3Factory.bytecode,
      deployer
    )
    uniswapV3Factory = await UniswapV3Factory.deploy()
    await uniswapV3Factory.deployed()

    uniswapV3Factory_address = uniswapV3Factory.address
    console.log('UniswapV3Factory deployed to:', uniswapV3Factory_address)
  } else {
    uniswapV3Factory = new ethers.Contract(
      uniswapV3Factory_address,
      artifacts.UniswapV3Factory.abi,
      deployer
    )
  }

  // UniswapV3PoolDeployer
  let uniswapV3PoolDeployer_address = ''
  let uniswapV3PoolDeployer
  if (!uniswapV3PoolDeployer_address) {
    const UniswapV3PoolDeployer = new ContractFactory(
      artifacts.UniswapV3PoolDeployer.abi,
      artifacts.UniswapV3PoolDeployer.bytecode,
      deployer
    )
    uniswapV3PoolDeployer = await UniswapV3PoolDeployer.deploy()
    await uniswapV3PoolDeployer.deployed()

    uniswapV3PoolDeployer_address = uniswapV3PoolDeployer.address
    console.log('UniswapV3PoolDeployer deployed to:', uniswapV3PoolDeployer_address)
  } else {
    uniswapV3PoolDeployer = new ethers.Contract(
      uniswapV3PoolDeployer_address,
      artifacts.UniswapV3PoolDeployer.abi,
      deployer
    )
  }

  // Save deployed CAs
  const contracts = {
    UniswapV3Factory: uniswapV3Factory_address,
    UniswapV3PoolDeployer: uniswapV3PoolDeployer_address,
  }

  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments')
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
  console.log(`Deployment addresses written to ./deployments/${networkName}.json`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
