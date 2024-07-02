import { HardhatUserConfig } from 'hardhat/config'
import dotenv from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import 'solidity-coverage'
import 'hardhat-deploy'

dotenv.config()

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  namedAccounts: {
    deployer: 0
  },
  networks: {
    hardhat: {
    },
    harmony: {
      url: 'https://api.harmony.one',
      accounts: [process.env.PRIVATE_KEY!]
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_MAINNET}`,
      accounts: [process.env.PRIVATE_KEY!],
      verify: {
        etherscan: {
          apiUrl: 'https://api.etherscan.io'
        }
      }
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_SEPOLIA}`,
      accounts: [process.env.PRIVATE_KEY!],
      verify: {
        etherscan: {
          apiUrl: 'https://api-sepolia.etherscan.io'
        }
      }
    }
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_KEY
    }
  }
}

export default config
