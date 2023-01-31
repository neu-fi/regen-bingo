import Head from "next/head";
import { Mint, Guide, FAQ, BGBlur } from "@/components";
import { useMediaQuery } from "react-responsive";

export default function Home() {
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

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
      {isMobile ? (
        <></>
      ) : (
        <>
          <section id="mint">
            <Mint></Mint>
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
      )}
    </>
  );
}
