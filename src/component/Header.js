import React, { useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import Connect from "./Connect";
import queryString from "query-string";

export default function Header() {
  const router = useRouter();

  return (
    <React.Fragment>
      <div id="gameon-preloader" className="gameon-preloader">
        <div className="preloader-animation">
          <div className="spinner"></div>
          <p className="fw-5 text-center text-uppercase">Loading</p>
        </div>

        <div className="loader-animation">
          <div className="row h-100">
            <div className="col-3 single-loader p-0">
              <div className="loader-bg"></div>
            </div>

            <div className="col-3 single-loader p-0">
              <div className="loader-bg"></div>
            </div>

            <div className="col-3 single-loader p-0">
              <div className="loader-bg"></div>
            </div>

            <div className="col-3 single-loader p-0">
              <div className="loader-bg"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="main">
        <header id="header">
          <nav
            data-aos="zoom-out"
            data-aos-delay="800"
            className="navbar gameon-navbar navbar-expand"
          >
            <div className="container full header">
              <div className="d-flex align-items-center">
                <Link className="navbar-brand" to="/">
                  <img
                    src={require("../images/logo.png").default}
                    alt="Brand Logo"
                  />
                </Link>
                <ul className="navbar-nav toggle">
                  <li className="nav-item">
                    <a
                      href="#sec"
                      className="nav-link px-2 pt-1"
                      data-toggle="modal"
                      data-target="#menu"
                    >
                      <i className="icon-menu m-0"></i>
                    </a>
                  </li>
                </ul>
              </div>
              <ul className="navbar-nav items mx-auto">
                <li className="nav-item">
                  <Link
                    to="/"
                    className={`nav-link  ${
                      router.pathname === "/" ? "active" : ""
                    }`}
                  >
                    Lock Token
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/token-locked"
                    className={`nav-link  ${
                      router.pathname === "/token-locked" ? "active" : ""
                    }`}
                  >
                    Token List
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/liquidity-locked"
                    className={`nav-link  ${
                      router.pathname === "/liquidity-locked" ? "active" : ""
                    }`}
                  >
                    LP Token List
                  </Link>
                </li>
              </ul>

              <ul className="navbar-nav action">
                <Connect />
              </ul>
            </div>
          </nav>
          {/* <div className="dex-section" style={{ marginTop: "80px" }}>
            <div className="container-fluid mt-3">
              <div className="row items-center">
                <div className="col-sm-12 col-md-12 col-lg-12">
                  <div className="header-hot-pairs">
                    <div className="left-container">
                      <h4 className="hot-pair">
                        <fa-icon icon="fire" className="ng-fa-icon mr-1">
                          <i className="fas fa-fire"></i>
                        </fa-icon>
                        <span className="">TRENDING</span>
                      </h4>
                    </div>
                    <div className="right-container">
                      <ul className="hot-pairs" id="webticker-1">
                        {poolstats.topPools.length > 0 &&
                          poolstats.topPools
                            .slice(0)
                            .reverse()
                            .map((rowdata, index) => {
                              return (
                                rowdata.startTime > 0 && (
                                  <li className="" ket={index}>
                                    <a
                                      className="ml-3 py-2 hot-pair first"
                                      href={
                                        rowdata.poolType === "0"
                                          ? `/presale-details/${
                                              rowdata.poolAddress
                                            }${`?chainid=${poolstats.chainId}`}`
                                          : rowdata.poolType === "1"
                                          ? `/private-details/${
                                              rowdata.poolAddress
                                            }${`?chainid=${poolstats.chainId}`}`
                                          : rowdata.poolType === "2"
                                          ? `/fairlaunch-details/${rowdata.poolAddress}?chainid=${poolstats.chainId}`
                                          : "/"
                                      }
                                    >
                                      <span>#{index + 1}</span>
                                      {rowdata.symbol ? rowdata.symbol : ""}
                                      <img
                                        className="hot-exchange"
                                        alt="uniswap-logo"
                                        src={
                                          rowdata.poolDetails.split("$#$")[0]
                                        }
                                      />
                                    </a>
                                  </li>
                                )
                              );
                            })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </header>

        <div id="menu" className="modal fade p-0">
          <div className="modal-dialog dialog-animated">
            <div className="modal-content h-100">
              <div className="modal-header" data-dismiss="modal">
                Menu <i className="far fa-times-circle icon-close"></i>
              </div>
              <div className="menu modal-body">
                <div className="row w-100">
                  <div className="items p-0 col-12 text-center"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export function useRouter() {
  const params = useParams();
  const location = useLocation();

  // Return our custom router object
  // Memoize so that a new object is only returned if something changes
  return useMemo(() => {
    return {
      // For convenience add push(), replace(), pathname at top level
      push: location.push,
      replace: location.replace,
      pathname: location.pathname,
      // Merge params and parsed query string into single "query" object
      // so that they can be used interchangeably.
      // Example: /:topic?sort=popular -> { topic: "react", sort: "popular" }
      query: {
        ...queryString.parse(location.search), // Convert string to object
        ...params,
      },
      // Include match, location, history objects so we have
      // access to extra React Router functionality if needed.
      location,
    };
  }, [params, location]);
}
