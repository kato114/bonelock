import React, { useState } from "react";
// import { toast } from 'react-toastify';
import HashLoader from "react-spinners/HashLoader";
import { useWeb3React } from "@web3-react/core";
import { Link } from "react-router-dom";
import { useCommonStats } from "./helper/useStats";

export default function TokenLockList() {
  const [updater, setUpdater] = useState({
    page: 0,
    pageSize: 10,
    loading: true,
  });
  const stats = useCommonStats(updater);
  const context = useWeb3React();
  const { chainId } = context;

  return (
    <div className="container">
      <React.Fragment>
        <section className="explore-area prev-project-area">
          <div className="row justify-content-left">
            <div className="col-12 col-md-8 col-lg-7">
              <div className="intro text-left">
                <div className="intro-content">
                  <span className="intro-text">Locked Token List</span>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center text-left">
            <div className="col-12">
              <div
                className="explore-menu btn-group btn-group-toggle flex-wrap justify-content-left text-left mb-md-4"
                data-toggle="buttons"
              >
                <label className="btn active d-table text-uppercase p-2">
                  <Link to="/token-locked" className="explore-btn">
                    <span>TokenLock List</span>
                  </Link>
                </label>
                <label className="btn d-table text-uppercase p-2">
                  <Link to="/my-token-lock" className="explore-btn text-white">
                    <span>My Lock</span>
                  </Link>
                </label>
              </div>
            </div>
          </div>

          <section className="leaderboard-area pt-2">
            <div className="row">
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">No</th>
                        <th scope="col">Name</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.loading ? (
                        <tr className="text-center mt-4">
                          <td style={{ border: "none" }}>Loading...</td>
                        </tr>
                      ) : stats.tokenList.length > 0 ? (
                        stats.tokenList
                          .slice(0)
                          .reverse()
                          .map((rowdata, index) => {
                            return (
                              <tr>
                                <td>
                                  {stats.page > 0
                                    ? stats.page * stats.pageSize + 1 + index
                                    : index + 1}
                                </td>
                                <td className="image-row">
                                  {" "}
                                  {rowdata.name} ~ {rowdata.symbol}
                                </td>
                                <td>
                                  {rowdata.amount
                                    ? rowdata.amount /
                                      Math.pow(10, rowdata.decimals)
                                    : "0"}{" "}
                                  {rowdata.symbol}
                                </td>
                                <td>
                                  <Link
                                    to={`/lock-details/${rowdata.token}${
                                      chainId ? `?chainid=${chainId}` : ""
                                    }`}
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr className="text-center mt-4">
                          <td style={{ backgroundColor: "transparent" }}>
                            No Record Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <nav>
                  <ul className="page-numbers">
                    <li>
                      {stats.page > 0 && (
                        <a
                          href="#sec"
                          onClick={(e) =>
                            setUpdater({
                              page: stats.page - 1,
                              pageSize: stats.pageSize,
                              loading: true,
                            })
                          }
                        >
                          <i className="icon-Vector mr-2"></i>Previous
                        </a>
                      )}
                    </li>
                    {Math.floor(
                      stats.allNormalTokenLockedCount / stats.pageSize
                    ) > parseFloat(stats.page) && (
                      <li>
                        <a
                          href="#sec"
                          onClick={(e) =>
                            setUpdater({
                              page: stats.page + 1,
                              pageSize: stats.pageSize,
                              loading: true,
                            })
                          }
                        >
                          Next<i className="icon-arrow_right ml-2"></i>
                        </a>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          </section>
        </section>
      </React.Fragment>
    </div>
  );
}
