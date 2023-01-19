import * as React from "react";
import type { AppProps } from "next/app";
import NextHead from "next/head";
import "@/styles/globals.css";
import { CHAINS, PROVIDER } from "@/config";
import { createClient, WagmiConfig } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { useIsMounted } from "../hooks";
import Layout from "@/components/Layout";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const { connectors } = getDefaultWallets({
  appName: "regen-bingo",
  chains: CHAINS,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors: connectors,
  provider: PROVIDER,
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
        chains={CHAINS}
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
