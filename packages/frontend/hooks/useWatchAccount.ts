import { GetAccountResult, Provider, watchAccount } from "@wagmi/core";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { deepEqual } from "wagmi";

export function useWatchAccount(
  account: GetAccountResult<Provider>,
  setAccount: Dispatch<SetStateAction<GetAccountResult<Provider>>>
) {
  useEffect(() => {
    watchAccount((newAccount) => {
      if (!deepEqual(newAccount, account)) {
        console.log("Captured: newAccount");
        setAccount(newAccount);
      }
    });
  }, [account]);
}
