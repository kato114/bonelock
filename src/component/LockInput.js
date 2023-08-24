import React, { useState } from "react";
import LoaderComponent from "./LoaderComponent";
import { formatPrice, getWeb3Contract } from "../hooks/contractHelper";
import tokenAbi from "../json/token.json";
import LPAbi from "../json/lpabi.json";
import { getWeb3 } from "../hooks/connectors";
import { useWeb3React } from "@web3-react/core";
import { contract } from "../hooks/constant";
import { MulticallContractWeb3 } from "../hooks/useContracts";

export default function LockInput(props) {
  const context = useWeb3React();
  const { chainId, account } = context;
  let { setValue, value } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInput = async (e) => {
    try {
      // e.preventDefault();
      let web3 = getWeb3(chainId);
      let checkAddress = await web3.utils.isAddress(e.target.value);
      if (checkAddress) {
        let checkSumaddress = await web3.utils.toChecksumAddress(
          e.target.value
        );
        let isCode = await web3.eth.getCode(e.target.value);
        if (!checkSumaddress || isCode === "0x") {
          setError("Please enter valid address !");
          return false;
        }
        let lpContract = await getWeb3Contract(LPAbi, e.target.value, chainId);
        let token0 = await lpContract.methods.token0().call();
        let token1 = await lpContract.methods.token1().call();

        let token0Contract = await getWeb3Contract(tokenAbi, token0, chainId);
        let token1Contract = await getWeb3Contract(tokenAbi, token1, chainId);

        const mc = MulticallContractWeb3(chainId);
        const data = await mc.aggregate([
          token0Contract.methods.symbol(),
          token1Contract.methods.symbol(),
          lpContract.methods.balanceOf(account),
          lpContract.methods.decimals(),
          lpContract.methods.allowance(account, contract.lockAddress),
        ]);

        if (data[0] !== "" && data[1] !== "") {
          setValue({
            ...value,
            tokenAddress: e.target.value,
            tokenName: "",
            islp: 1,
            Pair: `${data[0]}/${data[1]}`,
            balance: data[2] / Math.pow(10, data[3]),
            tokenDecimal: data[3],
            tokenSymbol: "",
            isApprove:
              parseFloat(data[4] / Math.pow(10, data[3])) > 100000000000
                ? true
                : false,
          });
          setError("");
        } else {
          setValue({
            ...value,
            tokenAddress: e.target.value,
            tokenName: "",
            islp: 2,
            tokenDecimal: "",
            tokenSymbol: "",
            balance: 0,
            isApprove: false,
          });
          setError("Please enter valid address !");
        }
      } else {
        setError("Please enter valid address!!");
        setValue({
          ...value,
          tokenAddress: e.target.value,
          tokenName: "",
          islp: 2,
          tokenDecimal: "",
          tokenSymbol: "",
          balance: 0,
          isApprove: false,
        });
      }
    } catch (err) {
      console.log(err.message);
      try {
        let tokenContract = await getWeb3Contract(
          tokenAbi,
          e.target.value,
          chainId
        );

        const mc = MulticallContractWeb3(chainId);
        const tokendata = await mc.aggregate([
          tokenContract.methods.name(),
          tokenContract.methods.decimals(),
          tokenContract.methods.symbol(),
          tokenContract.methods.balanceOf(account),
          tokenContract.methods.allowance(account, contract.lockAddress),
        ]);

        if (tokendata[1] > 0) {
          console.log("kato 2");
          let isApprove = tokendata[4]
            ? tokendata[4] / Math.pow(10, tokendata[1]) > 10000000000000000000
              ? true
              : false
            : false;
          setValue({
            ...value,
            tokenAddress: e.target.value,
            islp: 2,
            balance: tokendata[3] / Math.pow(10, tokendata[1]),
            tokenName: tokendata[0],
            tokenDecimal: tokendata[1],
            tokenSymbol: tokendata[2],
            isApprove,
          });
          setError("");
        } else {
          setValue({
            ...value,
            tokenAddress: e.target.value,
            tokenName: "",
            islp: 2,
            tokenDecimal: "",
            tokenSymbol: "",
            isApprove: false,
            balance: 0,
          });
          setError("Please enter valid address !");
        }
      } catch (err) {
        setValue({
          ...value,
          tokenAddress: e.target.value,
          tokenName: "",
          islp: 2,
          tokenDecimal: "",
          tokenSymbol: "",
          balance: 0,
          isApprove: false,
        });
        setError("Please enter valid address !");
        console.log(err.message, err);
      }
    }
    setIsLoading((prev) => !prev);
    return false;
  };

  return (
    <React.Fragment>
      <div className="col-md-12">
        <div className="form-group">
          <label>
            Token or LP Token address<span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            type="text"
            name="name"
            placeholder="Enter token or lp address"
            onChange={(e) => {
              handleInput(e);
              setIsLoading(true);
            }}
          />
          <small className="text-danger">{error}</small>
        </div>

        {isLoading === true ? (
          <LoaderComponent status={isLoading} />
        ) : value.islp === 1 ? (
          <React.Fragment>
            <div className="mt-3 d-flex justify-content-between card-span">
              <span>Pair</span>
              <span>{value.Pair}</span>
            </div>
            <div className="mt-2 d-flex justify-content-between card-span">
              <span>Balance</span>
              <span>{formatPrice(value.balance)}</span>
            </div>
          </React.Fragment>
        ) : (
          value.tokenName !== "" &&
          value.tokenDecimal &&
          value.tokenSymbol &&
          value.tokenAddress && (
            <React.Fragment>
              <div className="mt-3 d-flex justify-content-between card-span">
                <span>Name</span>
                <span>{value.tokenName}</span>
              </div>
              <div className="mt-2 d-flex justify-content-between card-span">
                <span>Symbol</span>
                <span>{value.tokenSymbol}</span>
              </div>
              <div className="mt-2 d-flex justify-content-between card-span">
                <span>Decimal</span>
                <span>{value.tokenDecimal}</span>
              </div>
              <div className="mt-2 d-flex justify-content-between card-span">
                <span>Balance</span>
                <span>{formatPrice(value.balance)}</span>
              </div>
            </React.Fragment>
          )
        )}
      </div>
    </React.Fragment>
  );
}
