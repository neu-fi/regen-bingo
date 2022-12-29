import React from "react";
import Header from "@/components/Header";
import BGBlur from "@/components/BGBlur";
import { PropsWithChildren } from "react";

type LayoutProps = {};

function Layout(props: PropsWithChildren<LayoutProps>) {
  return (
    <>
      <BGBlur></BGBlur>
      <Header></Header>
      <main>{props.children}</main>
    </>
  );
}

export default Layout;
