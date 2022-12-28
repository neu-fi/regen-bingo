import Head from 'next/head';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GetGreeter, SetGreeter } from '../components/contract';

export default function Home() {
  return (
    <div className={''}>
      <Head>
        <title>Regen Bingo</title>
        <meta name="description" content="A global trustless Bingo game where half of the proceeds go to public good funding" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header style={{ padding: '1rem' }}>
        <ConnectButton />
      </header>

      <main
        style={{
          minHeight: '60vh',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <GetGreeter />
        <SetGreeter />
      </main>
    </div>
  );
}
