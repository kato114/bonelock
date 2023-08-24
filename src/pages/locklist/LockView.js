import React from "react";
import { trimAddress } from "../../hooks/constant";
import { formatPrice } from "../../hooks/contractHelper";
import { useDetailsStats } from "./helper/useStats";
import { useWeb3React } from "@web3-react/core";
import { Link, useLocation } from "react-router-dom";

export default function LockView() {
  const stats = useDetailsStats(1);
  const context = useWeb3React();
  const { chainId } = context;
  const search = useLocation().search;
  const queryChainId = new URLSearchParams(search).get("chainid");

  return (
    <div className="container detail-page">
      <React.Fragment>
        <section className="explore-area prev-project-area">
          <div className="igo-rankging-table-list mt-5">
            <div className="card project-card m-3">
              <h4 className="card-title ml-3">Lock info</h4>
              <div className="card-body">
                <div className="mt-3 d-flex justify-content-between card-span">
                  <p>Current Locked Amount</p>
                  <p className="step-input-value">
                    {formatPrice(stats.cumulativeLockInfo)} {stats.LockedSymbol}
                  </p>
                </div>
                <div className="mt-3 d-flex justify-content-between card-p">
                  <p>Token Address </p>
                  <p className="step-input-value">{stats.TokenAddress}</p>
                </div>
                <div className="mt-3 d-flex justify-content-between card-p">
                  <p>Token Name</p>
                  <p className="step-input-value">{stats.TokenName}</p>
                </div>
                <div className="mt-3 d-flex justify-content-between card-p">
                  <p>Token Symbol</p>
                  <p className="step-input-value">{stats.TokenSymbol}</p>
                </div>
                <div className="mt-3 d-flex justify-content-between card-p">
                  <p>Token Decimals</p>
                  <p className="step-input-value">{stats.TokenDecimals}</p>
                </div>
              </div>
            </div>
            <div className="card project-card m-3 p-2">
              <h4 className="card-title ml-3">Lock records</h4>

              <table
                className="table"
                cellspacing="0"
                cellpadding="0"
                style={{ border: "none", color: "#fff" }}
              >
                <thead>
                  <tr>
                    <td>Wallet</td>
                    <td>Amount</td>
                    <td>Cycle(d)</td>
                    <td>Cycle Release(%)</td>
                    <td>TGE(%)</td>
                    <td>Unlock time(UTC)</td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {stats.lockdata.map((rowdata, index) => {
                    return (
                      <tr key={index}>
                        <td>{trimAddress(rowdata.owner)}</td>
                        <td>
                          {rowdata.amount / Math.pow(10, stats.TokenDecimals)}
                        </td>
                        <td>{rowdata.cycle > 0 ? rowdata.cycle / 60 : "-"}</td>
                        <td>
                          {rowdata.cycleBps > 0 ? rowdata.cycleBps / 100 : "-"}
                        </td>
                        <td>
                          {rowdata.tgeBps > 0 ? rowdata.tgeBps / 100 : "-"}
                        </td>
                        <td style={{ fontSize: "12px" }}>
                          {rowdata.tgeDate
                            ? new Date(rowdata.tgeDate * 1000)
                                .toUTCString()
                                .substring(4, 25)
                            : "-"}
                        </td>
                        <td>
                          <Link
                            to={`/lock-record/${rowdata.id}${
                              queryChainId
                                ? `?chainid=${queryChainId}`
                                : chainId
                                ? `?chainid=${chainId}`
                                : ""
                            }`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </React.Fragment>
    </div>
  );
}
