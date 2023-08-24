import ethCoin from "../images/ethereum.png";

export const supportNetwork = {
  1: {
    name: "Etherem",
    chainId: 1,
    rpc: "https://eth-mainnet.g.alchemy.com/v2/_1jxmHKFpouR8RjnG8NdYG1o21yT37GB",
    image: ethCoin,
    symbol: "Etherem",
  },
  // 5: {
  //   name: "Goerli Testnet",
  //   chainId: 5,
  //   rpc: "https://eth-goerli.g.alchemy.com/v2/5N02vS8nblN4kMJBLwV4N_gU7ZtSUL7O",
  //   image: ethCoin,
  //   symbol: "Goerli Testnet",
  // },
  default: {
    name: "Etherem",
    chainId: 1,
    rpc: "https://eth-mainnet.g.alchemy.com/v2/_1jxmHKFpouR8RjnG8NdYG1o21yT37GB",
    image: ethCoin,
    symbol: "Etherem",
  },
};

export const RPC_URLS = {
  1: "https://eth-mainnet.g.alchemy.com/v2/_1jxmHKFpouR8RjnG8NdYG1o21yT37GB",
  // 5: "https://eth-goerli.g.alchemy.com/v2/5N02vS8nblN4kMJBLwV4N_gU7ZtSUL7O",
};
