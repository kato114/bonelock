import React, { useState, useContext, useEffect } from "react";
import "./index.css";
import Lock from "./Lock";
import Context from "./context/Context";
import { useWeb3React } from "@web3-react/core";
import { defaultValue } from "./context/defaults";

import shibarium from "../../images/shibarium.png";

export default function MainLock() {
  const appContext = useContext(Context);
  const [context, setContext] = useState(appContext);
  const { chainId, account } = useWeb3React();

  const setValue = (value) => {
    setContext({ ...context, value });
  };

  useEffect(() => {
    setContext({ ...context, value: { ...defaultValue } });
    // eslint-disable-next-line
  }, [chainId, account]);

  const state = {
    ...context,
    setValue: setValue,
  };

  return (
    <Context.Provider value={state}>
      <React.Fragment>
        <section className="explore-area prev-project-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="intro d-flex justify-content-center align-items-end m-0">
                  <div className="intro-content text-center">
                    <img src={shibarium} style={{ height: "100px" }} />
                    <h3 className="mt-3 mb-0">Lock Your Token or LP-Token</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <section className="signup-step-container pt-5">
            <div className="container">
              <div className="row d-flex justify-content-center">
                <div className="col-10">
                  <div className="card stepcard">
                    <div className="card-body">
                      <form className="login-box">
                        <Lock />
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </React.Fragment>
    </Context.Provider>
  );
}
