import { PropsWithChildren } from "react";

type BGBlurProps = {
  type: "header" | "section" | "footer" | null;
  colors: string[];
};

interface IOptions {
  top: string;
  topSM: string;
  left: string;
  rotate?: "0" | string;
  leftSM: string;
}

export default function BGBlur(props: PropsWithChildren<BGBlurProps>) {
  const { type } = props;
  let options: IOptions | null = null;

  switch (type) {
    case "header":
      options = {
        top: "-10rem",
        topSM: "-20rem",
        left: "calc(50%-11rem)",
        rotate: "30deg",
        leftSM: "calc(50%-30rem)",
      };
    case "section":
      options = {
        top: "calc(100%-13rem)",
        topSM: "calc(100%-30rem)",
        left: "calc(50%+3rem)",
        rotate: "30deg",
        leftSM: "calc(50%+36rem)",
      };

    default:
      options = {
        top: "-10rem",
        topSM: "-20rem",
        left: "calc(50%-11rem)",
        rotate: "30deg",
        leftSM: "calc(50%-30rem)",
      };
  }
  return (
    <div
      className={`absolute inset-x-0 top-[${options.top}] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[${options.topSM}]`}
    >
      <svg
        className={`relative left-[${options.left}] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[${options.rotate}] sm:left-[${options.leftSM}] sm:h-[42.375rem]`}
        viewBox="0 0 1155 678"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
          fillOpacity=".3"
          d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
        />
        <defs>
          <linearGradient
            id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
            x1="1155.49"
            x2="-78.208"
            y1=".177"
            y2="474.645"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={props.colors[0]} />
            <stop offset={1} stopColor={props.colors[1]} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
