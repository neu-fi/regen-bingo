import * as React from "react";
import type { AppProps } from "next/app";
import NextHead from "next/head";
import "../styles/globals.css";

// Imports
import { chain, createClient, WagmiConfig, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  Chain,
  Theme,
  lightTheme,
} from "@rainbow-me/rainbowkit";

import { useIsMounted } from "../hooks";
import Layout from "@/components/Layout";

// Get environment variables
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID as string;
// const infuraId = process.env.NEXT_PUBLIC_INFURA_ID as string;

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

const { chains, provider } = configureChains(
  [chain.mainnet, hardhatChain],
  [publicProvider()]
);

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
