import { BGBlur, Header, Footer } from "@/components";
import { PropsWithChildren } from "react";

type LayoutProps = {};

function Layout(props: PropsWithChildren<LayoutProps>) {
  return (
    <div className="flex flex-col h-screen">
      <BGBlur type={"header"} colors={["#ffcc01", "#00e2ab"]}></BGBlur>
      <Header></Header>
      <main className="flex-grow">{props.children}</main>
      <Footer></Footer>
    </div>
  );
}

export default Layout;
