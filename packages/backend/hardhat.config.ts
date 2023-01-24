import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-exposed";
import chai from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);
chai.use(require("chai-bignumber")());

dotenv.config({ path: ".env" });
const defaultNetwork = process.env.NEXT_PUBLIC_NETWORK || "localhost";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
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
  }
};

export default config;
