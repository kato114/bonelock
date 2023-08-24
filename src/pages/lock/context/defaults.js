// This file holds the initial, default values for context
// Note: it's good practice to specify defaults here,
//  but in our case they are overwritten by the values
//  within AppContextProvider
import { currencies } from "../../../hooks/currencies";

export const defaultValue = {
  tokenAddress: "",
  tokenSymbol: "",
  tokenName: "",
  tokenDecimal: "",
  Pair: "",
  balance: 0,
  isApprove: false,
  isDiffOwner: false,
  owner: "",
  title: "",
  amount: "",
  isvesting: false,
  TGEDate: "",
  TGEPercent: 0,
  Cycle: 0,
  ReleasePercent: 0,
  islp: 2,
  feeToken: currencies[0].address,
};

const defaultContext = {
  value: defaultValue,
  setValue: () => {},
  handleInput: () => {},
};

export default defaultContext;
