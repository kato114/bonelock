import React, { useContext, useState } from "react";
import LockInput from "../../component/LockInput";
import Context from "./context/Context";
import { getWeb3 } from "../../hooks/connectors";
import { toast } from "react-toastify";
import { contract } from "../../hooks/constant";
import { currencies } from "../../hooks/currencies";
import { useWeb3React } from "@web3-react/core";
import {
  getContract,
  getWeb3Contract,
  mulDecimal,
} from "../../hooks/contractHelper";
import tokenAbi from "../../json/token.json";
import lockAbi from "../../json/lockabi.json";
import { parseEther } from "@ethersproject/units";
import Button from "react-bootstrap-button-loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import copyIcon from "../../images/icon.png";
import { useEffect } from "react";
import { CHAIN_ID } from "../../hooks/connectors";
import { MulticallContractWeb3 } from "../../hooks/useContracts";

export default function Lock() {
  const context = useWeb3React();
  const { chainId, account, library } = context;
  const { value, setValue } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [lockloading, setLockLoading] = useState(false);
  const [maxValue, setMaxValue] = useState(0);
  const [ethFee, setEthFee] = useState(0);
  const [feeTokens, setFeeTokens] = useState([]);
  const [feeApproved, setFeeApproved] = useState(true);
  const [error, setError] = useState({
    owner: "",
    title: "",
    amount: "",
    TGEDate: "",
    TGEPercent: "",
    Cycle: "",
    ReleasePercent: "",
  });

  const getFeeTokenList = async () => {
    const lockContract = getWeb3Contract(
      lockAbi,
      contract.lockAddress,
      CHAIN_ID
    );

    let _feeTokens = [];
    for (let i = 0; i < currencies.length; i++) {
      const { addr, amount } = await lockContract.methods
        .feeTokenList(currencies[i].address)
        .call();

      const _feeToken = {
        symbol: currencies[i].symbol,
        type: currencies[i].type,
        addr: addr,
        amount:
          currencies[i].type != 3
            ? amount / 10 ** currencies[i].decimals
            : amount / 100,
      };

      _feeTokens.push(_feeToken);

      if (currencies[i].symbol == "ETH") {
        setEthFee(amount);
      }
    }

    setFeeTokens(_feeTokens);
  };

  useEffect(async () => {
    await getFeeTokenList();
  }, []);

  const checkValidation = (input, inputValue) => {
    let terror = 0;
    let message = "";
    var reg;
    switch (input) {
      case "amount":
        inputValue = parseFloat(inputValue);
        reg = new RegExp(/^[+-]?\d+(\.\d+)?$/);
        if (!reg.test(inputValue) || parseFloat(inputValue) <= 0) {
          terror += 1;
          message = "Please Enter Valid Amount!";
        } else if (parseFloat(inputValue) > value.balance) {
          terror += 1;
          message = "Amount must be less than or equal to!";
        } else {
          message = "";
        }
        break;

      case "TGEDate":
        if (inputValue === "" || inputValue === null) {
          terror += 1;
          message = "Please enter valid date";
        } else if (inputValue < new Date()) {
          terror += 1;
          message = "Start Time must be after current time";
        } else {
          message = "";
        }
        break;
      case "TGEPercent":
      case "ReleasePercent":
        reg = new RegExp(/^\d+$/);
        if (!reg.test(inputValue) || parseFloat(inputValue) <= 0) {
          terror += 1;
          message = "Please Enter Valid Number!";
        } else if (
          (value.isvesting && !reg.test(inputValue)) ||
          parseFloat(inputValue) > 100
        ) {
          terror += 1;
          message = "Percentage must be less than 100%!";
        } else {
          message = "";
        }
        break;
      case "Cycle":
        reg = new RegExp(/^\d+$/);
        if (!reg.test(inputValue) || parseFloat(inputValue) <= 0) {
          terror += 1;
          message = "Please Enter Valid Number!";
        } else {
          message = "";
        }
        break;
      default:
        terror += 0;
        break;
    }

    if (terror > 0) {
      setError({ ...error, [input]: message });
      return false;
    } else {
      setError({ ...error, [input]: "" });
      return true;
    }
  };

  const checkAllValidation = () => {
    let terror = 0;
    var reg;
    Object.keys(value).map((key, index) => {
      switch (key) {
        case "title":
          if (value[key] === "") {
            terror += 1;
          }
          break;
        case "owner":
          if (value.isDiffOwner && value[key] === "") {
            terror += 1;
          }
          break;
        case "amount":
          reg = new RegExp(/^[+-]?\d+(\.\d+)?$/);
          if (!reg.test(value[key]) || parseFloat(value[key]) <= 0) {
            terror += 1;
          } else if (parseFloat(value[key]) > value.balance) {
            terror += 1;
          }
          break;

        case "TGEDate":
          if (value.isvesting && (value[key] === "" || value[key] === null)) {
            terror += 1;
          } else if (value.isvesting && value[key] < new Date()) {
            terror += 1;
          }
          break;
        case "TGEPercent":
        case "ReleasePercent":
          reg = new RegExp(/^\d+$/);
          if (
            value.isvesting &&
            (!reg.test(value[key]) || parseFloat(value[key]) <= 0)
          ) {
            terror += 1;
          } else if (
            value.isvesting &&
            (!reg.test(value[key]) || parseFloat(value[key]) > 100)
          ) {
            terror += 1;
          }
          break;
        case "Cycle":
          reg = new RegExp(/^\d+$/);
          if (
            value.isvesting &&
            (!reg.test(value[key]) || parseFloat(value[key]) <= 0)
          ) {
            terror += 1;
          }
          break;
        default:
          terror += 0;
          break;
      }
      return true;
    });
    if (terror > 0) {
      return false;
    } else {
      return true;
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (account) {
      if (chainId) {
        try {
          if (value.tokenAddress) {
            setLoading(true);
            let lockAddress = contract.lockAddress;
            let tokenContract = getContract(
              tokenAbi,
              value.tokenAddress,
              library
            );
            let amount = parseEther("1000000000000000000000000000").toString();

            let tx = await tokenContract.approve(lockAddress, amount, {
              from: account,
            });
            const resolveAfter3Sec = new Promise((resolve) =>
              setTimeout(resolve, 5000)
            );
            toast.promise(resolveAfter3Sec, {
              pending: "Waiting for confirmation 👌",
            });
            var interval = setInterval(async function () {
              let web3 = getWeb3(chainId);
              var response = await web3.eth.getTransactionReceipt(tx.hash);
              if (response != null) {
                clearInterval(interval);
                if (response.status === true) {
                  toast.success(
                    "success ! your last transaction is success 👍"
                  );
                  setLoading(false);
                  setValue({ ...value, isApprove: true });
                } else if (response.status === false) {
                  toast.error("error ! Your last transaction is failed.");
                  setLoading(false);
                } else {
                  toast.error("error ! something went wrong.");
                  setLoading(false);
                }
              }
            }, 5000);
          } else {
            toast.error("Please enter valid token address !");
            setLoading(false);
          }
        } catch (err) {
          toast.error(err.reason);
          setLoading(false);
        }
      } else {
        toast.error("Please select Smart Chain Network !");
        setLoading(false);
      }
    } else {
      toast.error("Please Connect Wallet!");
      setLoading(false);
    }
  };

  const handleApproveFeeToken = async (e) => {
    e.preventDefault();
    if (account) {
      if (chainId) {
        try {
          if (value.feeToken) {
            setLoading(true);
            let lockAddress = contract.lockAddress;
            let tokenContract = getContract(tokenAbi, value.feeToken, library);
            let amount = parseEther("1000000000000000000000000000").toString();

            let tx = await tokenContract.approve(lockAddress, amount, {
              from: account,
            });
            const resolveAfter3Sec = new Promise((resolve) =>
              setTimeout(resolve, 5000)
            );
            toast.promise(resolveAfter3Sec, {
              pending: "Waiting for confirmation 👌",
            });
            var interval = setInterval(async function () {
              let web3 = getWeb3(chainId);
              var response = await web3.eth.getTransactionReceipt(tx.hash);
              if (response != null) {
                clearInterval(interval);
                if (response.status === true) {
                  toast.success(
                    "success ! your last transaction is success 👍"
                  );
                  setLoading(false);
                  setFeeApproved(true);
                } else if (response.status === false) {
                  toast.error("error ! Your last transaction is failed.");
                  setLoading(false);
                } else {
                  toast.error("error ! something went wrong.");
                  setLoading(false);
                }
              }
            }, 5000);
          } else {
            toast.error("Please enter valid token address !");
            setLoading(false);
          }
        } catch (err) {
          toast.error(err.reason);
          setLoading(false);
        }
      } else {
        toast.error("Please select Smart Chain Network !");
        setLoading(false);
      }
    } else {
      toast.error("Please Connect Wallet!");
      setLoading(false);
    }
  };

  const onDiffOwner = (e) => {
    setValue({ ...value, isDiffOwner: e.target.checked });
  };

  const onChangeVesting = (e) => {
    setValue({ ...value, isvesting: e.target.checked });
  };

  const onOwnerAddress = (e) => {
    let web3 = getWeb3(chainId);
    let check = web3.utils.isAddress(e.target.value);
    if (!check) {
      setError({ ...error, [e.target.name]: "please enter valid address" });
    } else {
      setError({ ...error, [e.target.name]: "" });
    }
    setValue({ ...value, owner: e.target.value });
  };

  const onChangeInput = (e) => {
    e.preventDefault();
    checkValidation(e.target.name, e.target.value);
    setValue({ ...value, [e.target.name]: e.target.value });
  };

  const handleMax = (e) => {
    checkValidation("amount", value.balance);
    setValue({ ...value, amount: value.balance });
  };

  const handleEndTimeChange = (date) => {
    checkValidation("TGEDate", date);
    setValue({ ...value, TGEDate: date });
  };

  const handleLockToken = async (e) => {
    e.preventDefault();
    let check = checkAllValidation();
    if (check) {
      try {
        let web3 = getWeb3(chainId);
        setLockLoading(true);
        let lockAddress = contract.lockAddress;
        let lockContract = getContract(lockAbi, lockAddress, library);
        if (value.isvesting) {
          let tx = await lockContract.vestingLock(
            value.owner ? value.owner : account,
            value.tokenAddress,
            value.islp === 1 ? true : false,
            mulDecimal(value.amount, value.tokenDecimal),
            Math.floor(new Date(value.TGEDate).getTime() / 1000.0),
            value.TGEPercent * 100,
            value.Cycle * 60,
            value.ReleasePercent * 100,
            value.title,
            value.feeToken,
            {
              from: account,
              value: value.feeToken == currencies[0].address ? ethFee : 0,
            }
          );
          const resolveAfter3Sec = new Promise((resolve) =>
            setTimeout(resolve, 5000)
          );
          toast.promise(resolveAfter3Sec, {
            pending: "Waiting for confirmation 👌",
          });
          let interval = setInterval(async function () {
            var response = await web3.eth.getTransactionReceipt(tx.hash);
            if (response != null) {
              clearInterval(interval);
              if (response.status === true) {
                toast.success("success ! your last transaction is success 👍");
                setLockLoading(false);
              } else if (response.status === false) {
                toast.error("error ! Your last transaction is failed.");
                setLockLoading(false);
              } else {
                toast.error("error ! something went wrong.");
                setLockLoading(false);
              }
            }
          }, 5000);
        } else {
          let tx = await lockContract.lock(
            value.isDiffOwner ? value.owner : account,
            value.tokenAddress,
            value.islp === 1 ? true : false,
            mulDecimal(value.amount, value.tokenDecimal),
            web3.utils.toHex(
              Math.floor(new Date(value.TGEDate).getTime() / 1000.0)
            ),
            value.title,
            value.feeToken,
            {
              from: account,
              value: value.feeToken == currencies[0].address ? ethFee : 0,
            }
          );
          const resolveAfter3Sec = new Promise((resolve) =>
            setTimeout(resolve, 5000)
          );
          toast.promise(resolveAfter3Sec, {
            pending: "Waiting for confirmation 👌",
          });
          let interval = setInterval(async function () {
            var response = await web3.eth.getTransactionReceipt(tx.hash);
            if (response != null) {
              clearInterval(interval);
              if (response.status === true) {
                toast.success("success ! your last transaction is success 👍");
                setLockLoading(false);
              } else if (response.status === false) {
                toast.error("error ! Your last transaction is failed.");
                setLockLoading(false);
              } else {
                toast.error("error ! something went wrong.");
                setLockLoading(false);
              }
            }
          }, 5000);
        }
      } catch (err) {
        toast.error(err.reason ? err.reason : err.message);
        setLockLoading(false);
      }
    } else {
      toast.error("Please enter valid details!!");
      setLockLoading(false);
    }
  };

  const handleFeeChange = async (e, feeType) => {
    setValue({ ...value, feeToken: e.target.value });
    if (feeType == 2) {
      if (account !== null && account !== undefined) {
        const mc = MulticallContractWeb3(chainId);
        const tokenContract = await getWeb3Contract(
          tokenAbi,
          e.target.value,
          CHAIN_ID
        );
        const tokendata = await mc.aggregate([
          tokenContract.methods.decimals(),
          tokenContract.methods.allowance(account, contract.lockAddress),
        ]);

        let isApprove = tokendata[1]
          ? tokendata[1] / Math.pow(10, tokendata[0]) > 10000000000000000000
            ? true
            : false
          : false;

        setFeeApproved(isApprove);
      } else {
        setFeeApproved(false);
      }
    } else {
      setFeeApproved(true);
    }
  };

  return (
    <div className={`tab-pane active mt-3`} role="tabpanel" id="step1">
      <div className="row">
        <LockInput
          value={value}
          setValue={setValue}
          setMaxValue={setMaxValue}
        />

        <div className="col-md-12 mt-4 mb-0">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              onChange={(e) => onDiffOwner(e)}
              id="inlineCheckbox1"
            />
            <label className="form-check-label" htmlFor="inlineCheckbox1">
              use another owner?
            </label>
          </div>
        </div>

        {value.isDiffOwner && (
          <div className="col-md-12 mt-4 mb-0">
            <div className="form-group">
              <label>
                Owner<span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                value={value.owner}
                onChange={(e) => onOwnerAddress(e)}
                type="text"
                name="owner"
                placeholder="Enter Owner Address"
              />
              <small className="text-danger">{error.owner}</small>
              <br />
            </div>
          </div>
        )}

        <div className="col-md-6 mt-4 mb-0">
          <div className="form-group">
            <label>
              Title<span className="text-danger">*</span>
            </label>
            <input
              className="form-control"
              onChange={(e) => onChangeInput(e)}
              value={value.title}
              type="text"
              name="title"
              placeholder="Enter Token Lock Title"
            />
            <small className="text-danger">{error.title}</small>
            <br />
          </div>
        </div>
        <div className="col-md-6 mt-4 mb-0">
          <div className="form-group">
            <label>
              Amount<span className="text-danger">*</span>
            </label>
            <div className="d-flex">
              <input
                className="form-control"
                onChange={(e) => onChangeInput(e)}
                value={value.amount}
                type="text"
                name="amount"
                placeholder="Enter Token Amount"
                style={{
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "0px",
                  borderRight: "0px",
                }}
              />
              <button
                className="btn btn-max m-0 rounded-0"
                type="button"
                onClick={(e) => {
                  handleMax();
                }}
                style={{
                  borderColor: "white",
                  borderWidth: "1px",
                  borderLeft: "0px",
                }}
              >
                Max
              </button>
            </div>
            <small className="text-danger">{error.amount}</small>
            <br />
          </div>
        </div>

        <div className="col-md-12 mt-4 mb-0">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              onChange={(e) => onChangeVesting(e)}
              id="inlineCheckbox2"
            />
            <label className="form-check-label" htmlFor="inlineCheckbox2">
              use vesting?
            </label>
          </div>
        </div>

        {value.isvesting ? (
          <React.Fragment>
            <div className="col-md-6 mt-4 mb-0">
              <div className="form-group">
                <label>
                  TGE Date (Local time)<span className="text-danger">*</span>
                </label>
                <DatePicker
                  selected={value.TGEDate}
                  onChange={(date) => handleEndTimeChange(date)}
                  isClearable
                  placeholderText="Select End Time!"
                  minDate={new Date()}
                  showDisabledMonthNavigation
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </div>
              <small className="text-danger">{error.TGEDate}</small>
              <br />
            </div>

            <div className="col-md-6 mt-4 mb-0">
              <div className="form-group">
                <label>
                  TGE Percent<span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  value={value.TGEPercent}
                  onChange={(e) => onChangeInput(e)}
                  type="text"
                  name="TGEPercent"
                  placeholder="e.g. 20"
                />
                <small className="text-danger">{error.TGEPercent}</small>
                <br />
              </div>
            </div>

            <div className="col-md-6 mt-4 mb-0">
              <div className="form-group">
                <label>
                  Cycle (minutes)<span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  value={value.Cycle}
                  onChange={(e) => onChangeInput(e)}
                  type="text"
                  name="Cycle"
                  placeholder="e.g 10"
                />
                <small className="text-danger">{error.Cycle}</small>
                <br />
              </div>
            </div>

            <div className="col-md-6 mt-4 mb-0">
              <div className="form-group">
                <label>
                  Cycle Release Percent<span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  value={value.ReleasePercent}
                  onChange={(e) => onChangeInput(e)}
                  type="text"
                  name="ReleasePercent"
                  placeholder="e.g. 20"
                />
                <small className="text-danger">{error.ReleasePercent}</small>
                <br />
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div className="col-md-12 mt-4 mb-0">
            <div className="form-group">
              <label>
                Lock until (Local time)<span className="text-danger">*</span>
              </label>
              <DatePicker
                selected={value.TGEDate}
                onChange={(date) => handleEndTimeChange(date)}
                isClearable
                placeholderText="Select End Time!"
                minDate={new Date()}
                showDisabledMonthNavigation
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
            <small className="text-danger">{error.TGEDate}</small>
            <br />
          </div>
        )}

        <div className="col-md-12 mt-4 mb-0">
          <label>Fee Options</label>
          {feeTokens.map((fee, index) => {
            return (
              <div className="form-check" key={index}>
                <input
                  id={`fee-${index}`}
                  type="radio"
                  style={{ width: "auto" }}
                  className="form-check-input"
                  name="fees"
                  value={fee.addr}
                  onChange={(e) => handleFeeChange(e, fee.type)}
                  checked={value.feeToken == fee.addr ? true : false}
                />
                <label htmlFor={`fee-${index}`}>
                  {fee.amount} {fee.type == 3 && "% of "} {fee.symbol}
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <ul className="list-inline text-center">
        {value.isApprove ? (
          feeApproved ? (
            <li>
              <Button
                type="button"
                className="default-btn"
                loading={lockloading}
                onClick={(e) => handleLockToken(e)}
              >
                Lock
              </Button>
            </li>
          ) : (
            <li>
              <Button
                type="button"
                className="default-btn"
                onClick={(e) => handleApproveFeeToken(e)}
                loading={loading}
              >
                Approve Fee Token
              </Button>
            </li>
          )
        ) : (
          <li>
            <Button
              type="button"
              className="default-btn"
              onClick={(e) => handleApprove(e)}
              loading={loading}
            >
              Approve
            </Button>
          </li>
        )}
      </ul>
      <div className="mt-5">
        <span>
          Note : Please exclude Our Contract address
          <span className="step-input-value ml-3 mr-3">
            {contract.lockAddress}
          </span>
          <CopyToClipboard text={contract.lockAddress}>
            <img style={{ cursor: "pointer" }} src={copyIcon} alt="project" />
          </CopyToClipboard>{" "}
          from fees, rewards, max tx amount to start locking tokens.
        </span>
        <span>We don't support rebase tokens.</span>
      </div>
    </div>
  );
}
