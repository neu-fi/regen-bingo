import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-exposed";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { HardhatUserConfig } from "hardhat/types";
import { network } from "hardhat";
import "hardhat-gas-reporter"

chai.use(solidity);
chai.use(require("chai-bignumber")());

dotenv.config({ path: ".env" });
const defaultNetwork = process.env.NEXT_PUBLIC_NETWORK || "localhost";

const COMPILER_SETTINGS = {
  viaIR: true,
  optimizer: {
    enabled: true,
    runs: 200
  },
};

// Not using HardhatUserConfig type as it didn't work with hardhat-exposed v0.3.0
const config: any = {
  solidity: {
    compilers: [
      {
        version: "0.4.25"
      },
      {
        version: "0.7.0"
      }, 
      {
        version: "0.8.17",
        settings: COMPILER_SETTINGS
      }
    ],
  },
  defaultNetwork,
  networks: {
    localhost: {
      chainId: 31337,
    },
    mainnet: {
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY? [`${process.env.DEPLOYER_PRIVATE_KEY}`] : [],
    },
    goerli: {
      chainId: 5,
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY? [`${process.env.DEPLOYER_PRIVATE_KEY}`] : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  },
  contractSizer: {
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    except: ["contracts-exposed"]
  },
  exposed: {
    exclude: ["development/**", "interfaces/**"]
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 50,
    excludeContracts: ["$RegenBingoSVG", "LinkToken", "DateTimeContract", "VRFCoordinatorV2Mock"]
  }
};

export default config;
