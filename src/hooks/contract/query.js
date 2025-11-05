import { useGlobalAmount } from "@/store/useGlobalStates";
import { useQueryGetUser } from "../query";
import { queryKeys } from "../queryContants";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export const useQueryGetNftsFromContract = () => {
  const { address } = useAccount()
  const { data: user } = useQueryGetUser()
  const queryKey = [queryKeys.getNftsFromContract, user?.email, address];
  const { FACTORY_CONTRACT, } = useGlobalStore((state) => state.contract);

  const queryFn = async () => {
    const tx = await FACTORY_CONTRACT.getAllERC884Contracts()
    console.log({tx})
    return tx;
  };

  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (res) => {
      console.log(res);
    },
  });
};


// call owner function to check how is owner of factory contract
export const useQueryGetOwnerOfFactoryContract = () => {
  const { address } = useAccount()
  const { data: user } = useQueryGetUser()
  const queryKey = [queryKeys.getOwnerOfFactoryContract, user?.email, address];
  const { FACTORY_CONTRACT, } = useGlobalAmount((state) => state.contract);
  console.log("🚀 ~ useQueryGetOwnerOfFactoryContract ~ FACTORY_CONTRACT:", FACTORY_CONTRACT)
  const queryFn = async () => {
    const tx = await FACTORY_CONTRACT.owner()
    return tx;
  };


  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (res) => {
      console.log(res);
    },
  });
};
