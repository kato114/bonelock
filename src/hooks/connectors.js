import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { ethers } from "ethers";
import Web3 from "web3";
import { supportNetwork, RPC_URLS } from "./network";

export const CHAIN_ID = 1;
export const infura_Id = "_1jxmHKFpouR8RjnG8NdYG1o21yT37GB";

export const getRpcUrl = () => {
  return {
    1: "https://eth-mainnet.g.alchemy.com/v2/_1jxmHKFpouR8RjnG8NdYG1o21yT37GB",
    5: "https://eth-goerli.g.alchemy.com/v2/5N02vS8nblN4kMJBLwV4N_gU7ZtSUL7O",
  }[CHAIN_ID];
};

export const getWeb3 = (chainId) => {
  let setRpc = supportNetwork[chainId]
    ? supportNetwork[chainId].rpc
    : supportNetwork["default"].rpc;
  return new Web3(setRpc);
};

export const supportChainId = Object.keys(supportNetwork).map(function (key) {
  return parseInt(key);
});

export const injected = new InjectedConnector({
  supportedChainIds: supportChainId,
});

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  qrcode: true,
  infuraId: infura_Id,
});

export const coinbaseWallet = new WalletLinkConnector({
  url: `https://eth-mainnet.g.alchemy.com/v2/_1jxmHKFpouR8RjnG8NdYG1o21yT37GB`,
  appName: "Lauchpad App",
  supportedChainIds: supportChainId,
});

export const simpleRpcProvider = new ethers.providers.StaticJsonRpcProvider(
  getRpcUrl()
);
// export const web3 = new Web3(getRpcUrl());
