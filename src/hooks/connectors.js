import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { ethers } from "ethers";
import Web3 from "web3";
import { supportNetwork, RPC_URLS } from "./network";

export const CHAIN_ID = 109;
export const infura_Id = "_1jxmHKFpouR8RjnG8NdYG1o21yT37GB";

export const getRpcUrl = () => {
  return {
    109: "https://www.shibrpc.com",
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
  url: `https://www.shibrpc.com`,
  appName: "Bonelock",
  supportedChainIds: supportChainId,
});

export const simpleRpcProvider = new ethers.providers.StaticJsonRpcProvider(
  getRpcUrl()
);
// export const web3 = new Web3(getRpcUrl());
