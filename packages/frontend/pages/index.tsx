import Head from "next/head";
import { Guide, FAQ, BGBlur, Hero } from "@/components";

export default function Home() {
  return (
    <>
      <Head>
        <title>Regen Bingo</title>
        <meta
          name="description"
          content="A global trustless Bingo game where half of the proceeds go to public good funding"
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <>
        <section id="hero">
          <Hero></Hero>
        </section>
        <BGBlur type={"section"} colors={["#ffcc01", "#00e2ab"]}></BGBlur>
        <section id="guide">
          <Guide></Guide>
        </section>
        <section id="faq">
          <div className="bg-green-5">
            <FAQ></FAQ>
          </div>
        </section>
      </>
    </>
  );
}
