import React, { useState } from "react";
import Countdown, { zeroPad } from "react-countdown";
import { formatPrice } from "../../hooks/contractHelper";
import { useRecordStats } from "./helper/useStats";
import Button from "react-bootstrap-button-loader";
import { useWeb3React } from "@web3-react/core";
import lockAbi from "../../json/lockabi.json";
import { getWeb3 } from "../../hooks/connectors";
import { getContract } from "../../hooks/contractHelper";
import { toast } from "react-toastify";
import { contract } from "../../hooks/constant";

export default function LockRecord() {
  const { account, library, chainId } = useWeb3React();
  const [updater, setUpdater] = useState(new Date());
  const stats = useRecordStats(updater);
  const [ctLoading, setCtLoading] = useState(false);

  const countdownrender = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <div className="timer timer_1">
          <ul>
            <li>
              00<p>Day</p>
            </li>
            <li>
              00<p>Hours</p>
            </li>
            <li>
              00<p>Minutes</p>
            </li>
            <li>
              00<p>Seconds</p>
            </li>
          </ul>
        </div>
      );
    } else {
      // Render a countdown
      return (
        <div className="timer timer_1">
          <ul>
            <li>
              {zeroPad(days, 2)}
              <p>Day</p>
            </li>
            <li>
              {zeroPad(hours, 2)}
              <p>Hours</p>
            </li>
            <li>
              {zeroPad(minutes, 2)}
              <p>Minutes</p>
            </li>
            <li>
              {zeroPad(seconds, 2)}
              <p>Seconds</p>
            </li>
          </ul>
        </div>
      );
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setCtLoading(true);
    try {
      if (account) {
        let lockAddress = contract.lockAddress;
        let lockContract = getContract(lockAbi, lockAddress, library);

        let tx = await lockContract.unlock(stats.id, {
          from: account,
        });
        const resolveAfter3Sec = new Promise((resolve) =>
          setTimeout(resolve, 5000)
        );
        toast.promise(resolveAfter3Sec, {
          pending: "Waiting for confirmation",
        });

        var interval = setInterval(async function () {
          let web3 = getWeb3(chainId);
          var response = await web3.eth.getTransactionReceipt(tx.hash);
          if (response != null) {
            clearInterval(interval);
            if (response.status === true) {
              toast.success("success ! your last transaction is success");
              setUpdater(new Date());
              setCtLoading(false);
            } else if (response.status === false) {
              toast.error("error ! Your last transaction is failed.");
              setUpdater(new Date());
              setCtLoading(false);
            } else {
              toast.error("error ! something went wrong.");
              setUpdater(new Date());
              setCtLoading(false);
            }
          }
        }, 5000);
      } else {
        toast.error("Please Connect to wallet !");
        setCtLoading(false);
      }
    } catch (err) {
      toast.error(err.reason ? err.reason : err.message);
      setCtLoading(false);
    }
  };

  return (
    <div className="container detail-page">
      <React.Fragment>
        <section className="explore-area prev-project-area">
          <div className="igo-rankging-table-list pb-140 md-pb-60">
            <div className="row justify-content-center">
              <div className="col-md-10 col-12">
                <div className="card project-card m-3">
                  <div className="card-body">
                    <div className="row">
                      <h4 className="card-title">Lock info</h4>
                      <div className="col-12">
                        <div className="d-flex justify-content-center">
                          <p>Unlock In</p>
                        </div>
                        <div className="price-counter-new d-flex justify-content-center">
                          <div className="countdown">
                            <Countdown
                              key={Math.floor(Math.random() * 10 + 1)}
                              date={stats.tgeDate * 1000}
                              renderer={countdownrender}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-10 col-12">
                <div className="card project-card  m-3">
                  <h4 className="card-title ml-3">Token Info</h4>
                  <div className="card-body">
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Token Address</p>
                      <p className="step-input-value">{stats.TokenAddress}</p>
                    </div>
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Token Name</p>
                      <p className="step-input-value">{stats.TokenName}</p>
                    </div>
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Token Symbol</p>
                      <p className="step-input-value">{stats.TokenSymbol}</p>
                    </div>
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Token Decimals</p>
                      <p className="step-input-value">{stats.TokenDecimals}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-10 col-12">
                <div className="card project-card m-3">
                  <h4 className="card-title ml-3">Lock info</h4>

                  <div className="card-body">
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Title</p>
                      <p className="step-input-value">{stats.description}</p>
                    </div>
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Total Amount Locked</p>
                      <p className="step-input-value">
                        {formatPrice(stats.amount)} {stats.TokenSymbol}
                      </p>
                    </div>
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Owner</p>
                      <p className="step-input-value">{stats.owner}</p>
                    </div>
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Lock Date</p>
                      <p className="step-input-value">
                        {stats.lockDate
                          ? new Date(stats.lockDate * 1000)
                              .toUTCString()
                              .substring(4, 25)
                          : "-"}{" "}
                        UTC
                      </p>
                    </div>
                    {stats.cycle <= 0 ? (
                      <div className="mt-3 d-flex justify-content-between card-span">
                        <p>Unlock Date</p>
                        <p className="step-input-value">
                          {stats.tgeDate
                            ? new Date(stats.tgeDate * 1000)
                                .toUTCString()
                                .substring(4, 25)
                            : "-"}{" "}
                          UTC
                        </p>
                      </div>
                    ) : (
                      <React.Fragment>
                        <div className="mt-3 d-flex justify-content-between card-span">
                          <p>TGE Date</p>
                          <p className="step-input-value">
                            {stats.tgeDate
                              ? new Date(stats.tgeDate * 1000)
                                  .toUTCString()
                                  .substring(4, 25)
                              : "-"}{" "}
                            UTC
                          </p>
                        </div>
                        <div className="mt-3 d-flex justify-content-between card-span">
                          <p>TGE Percent</p>
                          <p className="step-input-value">
                            {stats.cycleBps ? stats.cycleBps / 100 : 0}%
                          </p>
                        </div>
                        <div className="mt-3 d-flex justify-content-between card-span">
                          <p>Cycle</p>
                          <p className="step-input-value">
                            {stats.cycle ? stats.cycle / 60 : 0} minutes
                          </p>
                        </div>
                        <div className="mt-3 d-flex justify-content-between card-span">
                          <p>Cycle Release Percent</p>
                          <p className="step-input-value">
                            {stats.tgeBps ? stats.tgeBps / 100 : 0} %
                          </p>
                        </div>
                      </React.Fragment>
                    )}
                    <div className="mt-3 d-flex justify-content-between card-span">
                      <p>Unlocked Amount</p>
                      <p className="step-input-value">
                        {stats.unlockedAmount ? stats.unlockedAmount : 0}{" "}
                        {stats.TokenSymbol}
                      </p>
                    </div>
                    {account &&
                      account.toLowerCase() === stats.owner.toLowerCase() && (
                        <div className="mt-3 d-flex justify-content-center">
                          <Button
                            variant="none"
                            loading={ctLoading}
                            className="default-btn next-step btn btn-primary"
                            onClick={(e) => handleUnlock(e)}
                          >
                            Unlock
                            {stats.withdrawableTokens > 0
                              ? `(${stats.withdrawableTokens} ${stats.TokenSymbol})`
                              : ""}
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </React.Fragment>
    </div>
  );
}
