// import { GetGreeter, SetGreeter } from "@/components";
import Head from "next/head";
import Layout from "@/components/Layout";
import Mint from "@/components/Mint";
import Guide from "@/components/Guide";
import FAQ from "@/components/FAQ";
import BGBlur from "@/components/BGBlur";

export default function Home() {
  return (
    <>
      <Head>
        <title>Regen Bingo</title>
        <meta
          name="description"
          content="A global trustless Bingo game where half of the proceeds go to public good funding"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section id="mint">
        <Mint></Mint>
      </section>
      <BGBlur type={"section"} colors={["#ffcc01", "#00e2ab"]}></BGBlur>
      <section id="guide">
        <Guide></Guide>
      </section>
      <section id="faq">
        <div className="pt-10 pb-40">
          <FAQ></FAQ>
        </div>
      </section>
    </>
  );
}
