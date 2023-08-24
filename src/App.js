import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop";
import Footer from "./component/Footer";
import Header from "./component/Header";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLock from "./pages/lock/MainLock";
import TokenLockList from "./pages/locklist/TokenLockList";
import LockView from "./pages/locklist/LockView";
import LockRecord from "./pages/locklist/LockRecord";
import MyTokenLock from "./pages/locklist/MyTokenLock";
import MyLpLock from "./pages/locklist/MyLpLock";
import LpLockList from "./pages/locklist/LpLockList";

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop>
          <ToastContainer pauseOnFocusLoss={false} />
          <Header />
          <Switch>
            <Route exact path="/">
              <MainLock />
            </Route>
            <Route exact path="/token-locked">
              <TokenLockList />
            </Route>
            <Route exact path="/liquidity-locked">
              <LpLockList />
            </Route>
            <Route exact path="/lock-details/:id">
              <LockView />
            </Route>
            <Route exact path="/lock-record/:id">
              <LockRecord />
            </Route>
            <Route exact path="/my-token-lock">
              <MyTokenLock />
            </Route>
            <Route exact path="/my-lp-lock">
              <MyLpLock />
            </Route>
          </Switch>
          <Footer />
        </ScrollToTop>
      </Router>
    </div>
  );
}

export default App;
