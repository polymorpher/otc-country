import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  namedAccounts: {
    deployer: 0
  },
  networks: {
    hardhat: {
    }
  }
};

export default config;
