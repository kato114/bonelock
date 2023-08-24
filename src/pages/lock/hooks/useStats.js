import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { MulticallContractWeb3 } from "../../../../hooks/useContracts";
import { getWeb3 } from "../../../../hooks/connectors";
import poolFactoryAbi from "../../../../json/poolfactory.json";
import { toast } from "react-toastify";
import { contract } from "../../../../hooks/constant";
import { useHistory } from "react-router-dom";

export const useCommonStats = (updater) => {
  const context = useWeb3React();
  const { chainId } = context;
  let history = useHistory();

  let web3 = getWeb3(chainId);
  let poolFactoryAddress = contract.poolfactory;

  const [stats, setStats] = useState({
    poolPrice: 0,
    auditPrice: 0,
    kycPrice: 0,
  });

  const mc = MulticallContractWeb3(chainId);
  let pmc = new web3.eth.Contract(poolFactoryAbi, poolFactoryAddress);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await mc.aggregate([
          pmc.methods.poolPrice(),
          pmc.methods.auditPrice(),
          pmc.methods.kycPrice(),
        ]);

        setStats({
          poolPrice: data[0] / Math.pow(10, 18),
          auditPrice: data[1] / Math.pow(10, 18),
          kycPrice: data[2] / Math.pow(10, 18),
        });
      } catch (err) {
        toast.error(err.reason);
        history.push("/presale-list");
      }
    };

    if (mc) {
      fetch();
    } else {
      setStats({
        poolPrice: 0,
        auditPrice: 0,
        kycPrice: 0,
      });
    }
    // eslint-disable-next-line
  }, [updater, chainId]);

  return stats;
};
