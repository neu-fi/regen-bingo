// import { GetGreeter, SetGreeter } from "@/components";
import Head from "next/head";
import Layout from "@/components/Layout";
import Mint from "@/components/Mint";
import Guide from "@/components/Guide";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <div className="isolate bg-white">
      <Head>
        <title>Regen Bingo</title>
        <meta
          name="description"
          content="A global trustless Bingo game where half of the proceeds go to public good funding"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <section id="mint">
          <Mint></Mint>
        </section>
        <section id="guide">
          <Guide></Guide>
        </section>
        <section id="faq">
          <FAQ></FAQ>
        </section>
      </Layout>
    </div>
  );
}
