require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    world: {
      url: "https://world-testnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY", // Replace with your Alchemy key
      chainId: 480, // World Chain testnet
      accounts: [process.env.PRIVATE_KEY], // Your private key
    },
    worldMainnet: {
      url: "https://world-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY", // Replace with your Alchemy key
      chainId: 480, // World Chain mainnet
      accounts: [process.env.PRIVATE_KEY], // Your private key
    },
  },
  etherscan: {
    apiKey: {
      world: "YOUR_ETHERSCAN_API_KEY", // Replace with your Etherscan API key
    },
    customChains: [
      {
        network: "world",
        chainId: 480,
        urls: {
          apiURL: "https://worldscan.org/api",
          browserURL: "https://worldscan.org",
        },
      },
    ],
  },
};
