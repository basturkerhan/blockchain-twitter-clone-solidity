require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */


module.exports = {
  
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: process.env.ALCHEMY_GOERLI_URL,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
      chainId: 5
    },
    hardhat: {
      chainId: 1337
    }
  },
};
