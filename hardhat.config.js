require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

//RPCS
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const BSC_RPC_URL = process.env.BSC_RPC_URL;
//Account
const PRIVATE_KEY = process.env.PRIVATE_KEY;
//For verifying
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const MUMBAI_API = process.env.MUMBAI_API_KEY;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        /*mainnet: {
            url: process.env.MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 1,
            blockConfirmations: 6,
        },*/
        mumbai: {
          chainId: 80001,
          blockConfirmations: 6,
          url: MUMBAI_RPC_URL,
          accounts: [PRIVATE_KEY]
        },
        bsctestnet: {
            chainId: 97,
            blockConfirmations: 6,
            url: BSC_RPC_URL,
            accounts: [PRIVATE_KEY]
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    etherscan: {
      apiKey: {
        polygonMumbai: MUMBAI_API,
        goerli: ETHERSCAN_API_KEY,
        bscTestnet: BSCSCAN_API_KEY
      }
  },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
    mocha: {
        timeout: 200000,
    },
}