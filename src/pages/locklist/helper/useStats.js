import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { MulticallContractWeb3 } from "../../../hooks/useContracts";
import { getWeb3 } from "../../../hooks/connectors";
import lockAbi from "../../../json/lockabi.json";
import tokenAbi from "../../../json/token.json";
import LPAbi from "../../../json/lpabi.json";
import { toast } from "react-toastify";
import { contract } from "../../../hooks/constant";
import { useLocation, useHistory } from "react-router-dom";
import { getWeb3Contract } from "../../../hooks/contractHelper";

export const useCommonStats = (updater) => {
  let { page, pageSize, loading } = updater;

  const context = useWeb3React();
  const { chainId } = context;
  let history = useHistory();

  let web3 = getWeb3(chainId);
  let lockAddress = contract.lockAddress;

  const [stats, setStats] = useState({
    allNormalTokenLockedCount: 0,
    page: page,
    pageSize: pageSize,
    tokenList: [],
    loading: true,
  });

  const mc = MulticallContractWeb3(chainId);
  let pmc = new web3.eth.Contract(lockAbi, lockAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mc.aggregate([
          pmc.methods.allNormalTokenLockedCount(),
        ]);

        if (data[0] > 0) {
          let start = data[0] - 1 - page * pageSize - (pageSize - 1);
          let end = start + pageSize - 1;

          const lockdata = await mc.aggregate([
            pmc.methods.getCumulativeNormalTokenLockInfo(
              start >= 0 ? start : 0,
              end < pageSize ? pageSize : end
            ),
          ]);

          Promise.all(
            lockdata[0].map(async (value, index) => {
              let tc = new web3.eth.Contract(tokenAbi, value.token);
              const tokendata = await mc.aggregate([
                tc.methods.name(),
                tc.methods.symbol(),
                tc.methods.decimals(),
              ]);
              return {
                amount: value.amount,
                decimals: tokendata[2],
                token: value.token,
                factory: value.factory,
                name: tokendata[0],
                symbol: tokendata[1],
              };
            })
          ).then((result) => {
            setStats({
              allNormalTokenLockedCount: data[0],
              tokenList: result,
              page: page,
              pageSize: pageSize,
              loading: !loading,
            });
          });
        } else {
          setStats({
            allNormalTokenLockedCount: data[0],
            tokenList: [],
            page: page,
            pageSize: pageSize,
            loading: !loading,
          });
        }
      } catch (err) {
        toast.error(err.reason);
        history.push("/");
      }
    };

    if (mc) {
      fetch();
    } else {
      setStats({
        allNormalTokenLockedCount: 0,
        page: page,
        pageSize: pageSize,
        tokenList: [],
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};

export const useCommonLpStats = (updater) => {
  let { page, pageSize, loading } = updater;

  const context = useWeb3React();
  const { chainId } = context;
  let history = useHistory();

  let web3 = getWeb3(chainId);
  let lockAddress = contract.lockAddress;

  const [stats, setStats] = useState({
    allNormalTokenLockedCount: 0,
    page: page,
    pageSize: pageSize,
    tokenList: [],
    loading: true,
  });

  const mc = MulticallContractWeb3(chainId);
  let pmc = new web3.eth.Contract(lockAbi, lockAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mc.aggregate([pmc.methods.allLpTokenLockedCount()]);

        if (data[0] > 0) {
          let start = data[0] - 1 - page * pageSize - (pageSize - 1);
          let end = start + pageSize - 1;

          const lockdata = await mc.aggregate([
            pmc.methods.getCumulativeLpTokenLockInfo(
              start >= 0 ? start : 0,
              end < pageSize ? pageSize : end
            ),
          ]);

          Promise.all(
            lockdata[0].map(async (value, index) => {
              let lpContract = new web3.eth.Contract(LPAbi, value.token);
              let token0 = await lpContract.methods.token0().call();
              let token1 = await lpContract.methods.token1().call();
              let decimals = await lpContract.methods.decimals().call();

              let token0Contract = await getWeb3Contract(
                tokenAbi,
                token0,
                chainId
              );
              let token1Contract = await getWeb3Contract(
                tokenAbi,
                token1,
                chainId
              );

              const mc = MulticallContractWeb3(chainId);
              const lpdata = await mc.aggregate([
                token0Contract.methods.symbol(),
                token1Contract.methods.symbol(),
                lpContract.methods.symbol(),
              ]);

              return {
                amount: value.amount,
                decimals: decimals,
                token: value.token,
                factory: value.factory,
                name: `${lpdata[0]}/${lpdata[1]}`,
                symbol: lpdata[2],
              };
            })
          ).then((result) => {
            setStats({
              allNormalTokenLockedCount: data[0],
              tokenList: result,
              page: page,
              pageSize: pageSize,
              loading: !loading,
            });
          });
        } else {
          setStats({
            allNormalTokenLockedCount: data[0],
            tokenList: [],
            page: page,
            pageSize: pageSize,
            loading: !loading,
          });
        }
      } catch (err) {
        toast.error(err.reason);
        history.push("/");
      }
    };

    if (mc) {
      fetch();
    } else {
      setStats({
        allNormalTokenLockedCount: 0,
        page: page,
        pageSize: pageSize,
        tokenList: [],
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};

export const useDetailsStats = (updater) => {
  const context = useWeb3React();
  const { chainId } = context;
  const location = useLocation();
  let urlAddress = location.pathname.split("/").pop();
  const search = useLocation().search;
  const queryChainId = new URLSearchParams(search).get("chainid");

  let web3 = getWeb3(queryChainId ? queryChainId : chainId);
  let lockAddress = contract.lockAddress;

  const [stats, setStats] = useState({
    cumulativeLockInfo: 0,
    CurrentLockedAmount: 0,
    TokenAddress: "",
    TokenName: "",
    TokenSymbol: "",
    TokenDecimals: "",
    lockdata: [],
  });

  const mc = MulticallContractWeb3(chainId);
  let pmc = new web3.eth.Contract(lockAbi, lockAddress);
  let tc = new web3.eth.Contract(tokenAbi, urlAddress);
  let lpContract = new web3.eth.Contract(LPAbi, urlAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        let data = [];
        let lp = true;
        try {
          let token0 = await lpContract.methods.token0().call();
          let token1 = await lpContract.methods.token1().call();

          let token0Contract = await getWeb3Contract(tokenAbi, token0, chainId);
          let token1Contract = await getWeb3Contract(tokenAbi, token1, chainId);

          data = await mc.aggregate([
            pmc.methods.totalLockCountForToken(urlAddress),
            lpContract.methods.name(),
            lpContract.methods.symbol(),
            lpContract.methods.decimals(),
            pmc.methods.cumulativeLockInfo(urlAddress),
            token0Contract.methods.symbol(),
            token1Contract.methods.symbol(),
          ]);
          lp = true;
        } catch (err) {
          data = await mc.aggregate([
            pmc.methods.totalLockCountForToken(urlAddress),
            tc.methods.name(),
            tc.methods.symbol(),
            tc.methods.decimals(),
            pmc.methods.cumulativeLockInfo(urlAddress),
          ]);
          lp = false;
        }

        const lockdata = await mc.aggregate([
          pmc.methods.getLocksForToken(
            urlAddress,
            0,
            data[0] <= 0 ? 0 : data[0] - 1
          ),
        ]);

        setStats({
          cumulativeLockInfo: data[4][2] / Math.pow(10, data[3]),
          CurrentLockedAmount: 0,
          TokenAddress: urlAddress,
          TokenName: data[1],
          TokenSymbol: data[2],
          TokenDecimals: data[3],
          lockdata: lockdata[0],
          LockedSymbol: lp? `${data[5]}/${data[6]}` : data[2]
        });
      } catch (err) {
        // toast.error(err.message)
        // history.push('/');
      }
    };

    if (mc) {
      fetch();
    } else {
      setStats({
        cumulativeLockInfo: 0,
        CurrentLockedAmount: 0,
        TokenAddress: "",
        TokenName: "",
        TokenSymbol: "",
        TokenDecimals: "",
        lockdata: [],
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};

export const useRecordStats = (updater) => {
  const context = useWeb3React();
  const { chainId } = context;
  const location = useLocation();
  let lockId = location.pathname.split("/").pop();
  const search = useLocation().search;
  const queryChainId = new URLSearchParams(search).get("chainid");

  let web3 = getWeb3(queryChainId ? queryChainId : chainId);
  let lockAddress = contract.lockAddress;

  const [stats, setStats] = useState({
    TokenAddress: "",
    TokenName: "",
    TokenSymbol: "",
    TokenDecimals: "",
    amount: 0,
    cycle: 0,
    cycleBps: 0,
    id: 0,
    lockDate: 0,
    owner: "",
    tgeBps: 0,
    tgeDate: 0,
    unlockedAmount: 0,
    withdrawableTokens: 0,
    description: "",
  });

  const mc = MulticallContractWeb3(queryChainId ? queryChainId : chainId);
  let pmc = new web3.eth.Contract(lockAbi, lockAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mc.aggregate([
          pmc.methods.getLockById(lockId),
          pmc.methods.withdrawableTokens(lockId),
        ]);
        let tokendata = [];
        let lp = true;

        try {
          let lpContract = new web3.eth.Contract(LPAbi, data[0].token);
          let token0 = await lpContract.methods.token0().call();
          let token1 = await lpContract.methods.token1().call();

          let token0Contract = await getWeb3Contract(tokenAbi, token0, chainId);
          let token1Contract = await getWeb3Contract(tokenAbi, token1, chainId);

          tokendata = await mc.aggregate([
            token0Contract.methods.symbol(),
            token1Contract.methods.symbol(),
            lpContract.methods.decimals(),
          ]);
          lp = true;
        } catch (err) {
          let tc = new web3.eth.Contract(tokenAbi, data[0].token);

          tokendata = await mc.aggregate([
            tc.methods.name(),
            tc.methods.symbol(),
            tc.methods.decimals(),
          ]);
          lp = false;
        }

        setStats({
          TokenAddress: data[0].token,
          TokenName: lp ? `${tokendata[0]}/${tokendata[1]}` : tokendata[0],
          TokenSymbol: lp ? `${tokendata[0]}/${tokendata[1]}` : tokendata[1],
          TokenDecimals: tokendata[2],
          amount: data[0].amount / Math.pow(10, tokendata[2]),
          cycle: data[0].cycle,
          cycleBps: data[0].cycleBps,
          id: data[0].id,
          lockDate: data[0].lockDate,
          owner: data[0].owner,
          tgeBps: data[0].tgeBps,
          tgeDate: data[0].tgeDate,
          unlockedAmount: data[0].unlockedAmount / Math.pow(10, tokendata[2]),
          description: data[0].description,
          withdrawableTokens: data[1] / Math.pow(10, tokendata[2]),
        });
      } catch (err) {}
    };

    if (mc) {
      fetch();
    } else {
      setStats({
        TokenAddress: "",
        TokenName: "",
        TokenSymbol: "",
        TokenDecimals: "",
        amount: 0,
        cycle: 0,
        cycleBps: 0,
        id: 0,
        lockDate: 0,
        owner: "",
        tgeBps: 0,
        tgeDate: 0,
        unlockedAmount: 0,
        withdrawableTokens: 0,
        description: "",
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};

export const useMyTokenLockStats = (updater) => {
  let { loading } = updater;

  const context = useWeb3React();
  const { chainId, account } = context;
  let history = useHistory();

  let web3 = getWeb3(chainId);
  let lockAddress = contract.lockAddress;

  const [stats, setStats] = useState({
    allNormalTokenLockedCount: 0,
    tokenList: [],
    loading: true,
  });

  const mc = MulticallContractWeb3(chainId);
  let pmc = new web3.eth.Contract(lockAbi, lockAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mc.aggregate([
          pmc.methods.normalLockCountForUser(account),
        ]);

        if (data[0] > 0) {
          const lockdata = await mc.aggregate([
            pmc.methods.normalLocksForUser(account),
          ]);

          Promise.all(
            lockdata[0].map(async (value, index) => {
              let tc = new web3.eth.Contract(tokenAbi, value.token);
              const tokendata = await mc.aggregate([
                tc.methods.name(),
                tc.methods.symbol(),
                tc.methods.decimals(),
              ]);
              return {
                amount: value.amount,
                decimals: tokendata[2],
                token: value.token,
                factory: value.factory,
                name: tokendata[0],
                symbol: tokendata[1],
              };
            })
          ).then((result) => {
            setStats({
              allNormalTokenLockedCount: data[0],
              tokenList: result,
              loading: !loading,
            });
          });
        } else {
          setStats({
            allNormalTokenLockedCount: data[0],
            tokenList: [],
            loading: !loading,
          });
        }
      } catch (err) {
        toast.error(err.reason);
        history.push("/");
      }
    };

    if (mc && account && chainId) {
      fetch();
    } else {
      setStats({
        allNormalTokenLockedCount: 0,
        tokenList: [],
        loading: !loading,
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};

export const useMyLpLockStats = (updater) => {
  let { loading } = updater;

  const context = useWeb3React();
  const { chainId, account } = context;
  let history = useHistory();

  let web3 = getWeb3(chainId);
  let lockAddress = contract.lockAddress;

  const [stats, setStats] = useState({
    allNormalTokenLockedCount: 0,
    tokenList: [],
    loading: true,
  });

  const mc = MulticallContractWeb3(chainId);
  let pmc = new web3.eth.Contract(lockAbi, lockAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mc.aggregate([
          pmc.methods.lpLockCountForUser(account),
        ]);

        if (data[0] > 0) {
          const lockdata = await mc.aggregate([
            pmc.methods.lpLocksForUser(account),
          ]);

          Promise.all(
            lockdata[0].map(async (value, index) => {
              let lpContract = new web3.eth.Contract(LPAbi, value.token);
              let token0 = await lpContract.methods.token0().call();
              let token1 = await lpContract.methods.token1().call();

              let token0Contract = await getWeb3Contract(
                tokenAbi,
                token0,
                chainId
              );
              let token1Contract = await getWeb3Contract(
                tokenAbi,
                token1,
                chainId
              );

              let tokendata = await mc.aggregate([
                token0Contract.methods.symbol(),
                token1Contract.methods.symbol(),
                lpContract.methods.decimals(),
                lpContract.methods.symbol(),
              ]);
              return {
                amount: value.amount,
                decimals: tokendata[2],
                token: value.token,
                factory: value.factory,
                name: `${tokendata[0]}/${tokendata[1]}`,
                symbol: tokendata[3],
              };
            })
          ).then((result) => {
            setStats({
              allNormalTokenLockedCount: data[0],
              tokenList: result,
              loading: !loading,
            });
          });
        } else {
          setStats({
            allNormalTokenLockedCount: data[0],
            tokenList: [],
            loading: !loading,
          });
        }
      } catch (err) {
        toast.error(err.reason);
        history.push("/");
      }
    };

    if (mc && account && chainId) {
      fetch();
    } else {
      setStats({
        allNormalTokenLockedCount: 0,
        tokenList: [],
        loading: !loading,
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};
