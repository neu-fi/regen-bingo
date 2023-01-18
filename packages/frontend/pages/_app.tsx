import * as React from "react";
import type { AppProps } from "next/app";
import NextHead from "next/head";
import "@/styles/globals.css";

// Imports
import { chain, createClient, WagmiConfig, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  Chain,
  lightTheme,
} from "@rainbow-me/rainbowkit";

import { useIsMounted } from "../hooks";
import Layout from "@/components/Layout";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { NETWORK_ID } from "../config";

// Get environment variables
// const alchemyId = process.env.ALCHEMY_ID as string;
// const infuraId = process.env.INFURA_ID as string;

const hardhatChain: Chain = {
  id: 31337,
  name: "Hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Hardhat",
    symbol: "HARD",
  },
  network: "hardhat",
  rpcUrls: {
    default: "http://127.0.0.1:8545",
  },
  testnet: true,
};

const supportedChain = [];
switch (NETWORK_ID) {
  case 1:
    supportedChain.push(chain.mainnet);
    break;
  case 5:
    supportedChain.push(chain.goerli);
    break;
  case 31337:
    supportedChain.push(hardhatChain);
    break;
  default:
    supportedChain.push(hardhatChain);
}

const { chains, provider } = configureChains(supportedChain, [
  publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: "regen-bingo",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();

  if (!isMounted) return null;
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: "#02e2aead",
          accentColorForeground: "#000",
          borderRadius: "large",
        })}
        chains={chains}
      >
        <ToastContainer />
        <NextHead>
          <title>Regen Bingo</title>
        </NextHead>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;
