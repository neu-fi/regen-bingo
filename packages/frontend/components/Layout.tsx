import React from "react";
import Header from "@/components/Header";
import BGBlur from "@/components/BGBlur";

type LayoutProps = {};

function Layout(props: LayoutProps) {
  return (
    <>
      <BGBlur></BGBlur>
      <Header></Header>
    </>
  );
}

export default Layout;
