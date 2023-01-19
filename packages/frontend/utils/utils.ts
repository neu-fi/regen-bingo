import { ICard, ITokenURI } from "@/components/Card";
import { Contract } from "ethers";
import { toast, ToastOptions } from "react-toastify";
import { getNetwork } from "@wagmi/core";
import { CHAIN_ID, CHAIN_NAME } from "@/config";

export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export const timeFormatter: Intl.RelativeTimeFormat =
  new Intl.RelativeTimeFormat("en-US", {
    numeric: "auto",
  });

const DIVISIONS: any[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

export function getTimeDifference(
  timestamp: string | number
): string | undefined {
  const now = new Date();
  const date = new Date(timestamp);
  let diff = (date.getTime() - now.getTime()) / 1000;
  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i];
    if (Math.abs(diff) < division.amount) {
      return timeFormatter.format(
        Math.round(diff),
        division.name as Intl.RelativeTimeFormatUnit
      );
    }
    diff /= division.amount;
  }
}

export function timestampToCountdown(timeDifferenceAsSeconds: number): string {
  let difference = timeDifferenceAsSeconds;
  const seconds = Math.floor(difference % 60);
  difference /= 60;
  const minutes = Math.floor(difference % 60);
  difference /= 60;
  const hours = Math.floor(difference % 24);
  const days = Math.floor(difference / 24);
  return `
    ${days ? `${days} Days, ` : ""}
    ${hours ? `${hours} Hours, ` : ""}
    ${minutes ? `${minutes} Minutes, ` : ""}
    ${seconds ? `${seconds} Seconds` : ""}
    `;
}

export const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  theme: "light",
};

export function errorSlicing(error: string) {
  try {
    const left = error.indexOf("'");
    return error.slice(left + 1, error.length - 1);
  } catch (err) {
    return "Unexpected error";
  }
}

export function clipHash(hash: string) {
  return hash.slice(0, 6) + "..." + hash.slice(hash.length - 4, hash.length);
}

export async function getToken(
  contract: Contract,
  tokenId: string
): Promise<ICard> {
  try {
    const tokenURIBase64 = await contract.tokenURI(tokenId);
    let tokenURI = JSON.parse(
      Buffer.from(tokenURIBase64.split(",")[1], "base64").toString()
    );
    tokenURI.image = Buffer.from(
      tokenURI.image.split(",")[1],
      "base64"
    ).toString();

    const coveredNumbersCount = Number(
      (await contract.coveredNumbers(tokenId)).toString()
    );

    const card: ICard = {
      id: tokenId,
      coveredNumbersCount,
      tokenURI: tokenURI,
    };
    return card;
  } catch (err) {
    throw err;
  }
}

export function isNetworkCorrect() {
  const network = getNetwork();
  if (network.chain && network.chain.id !== CHAIN_ID) {
    return false;
  }
  return true;
}

export function isSVG(image: string): boolean {
  return image.includes(`<svg `);
}

export const svg: string = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 721.28 241.28"><defs><style>.d{fill:#ffefa7;}.e{fill:#ffcd05;}.f{fill:#231f20;}.g{fill:#1fb78f;stroke:#231f20;stroke-miterlimit:10;stroke-width:.75px;}</style></defs><g id="a"/><g id="b"><g id="c"><g><g><polygon class="e" points="70.75 70.75 70.75 10.53 10.53 10.53 1.28 1.28 80 1.28 80 80 70.75 70.75"/><path class="f" d="M79.62,1.66V79.09l-8.5-8.5V10.16H10.69L2.19,1.66H79.62m.75-.75H.37L10.37,10.91h60v60l10,10V.91h0Z"/></g><polygon class="g" points="80.38 80.91 .38 80.91 .38 .91 10.38 10.91 10.38 70.91 70.38 70.91 80.38 80.91"/><g><polygon class="e" points="150.75 70.75 150.75 10.53 90.53 10.53 81.28 1.28 160 1.28 160 80 150.75 70.75"/><path class="f" d="M159.62,1.66V79.09l-8.5-8.5V10.16h-60.44L82.19,1.66h77.44m.75-.75H80.37l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="160.38 80.91 80.38 80.91 80.38 .91 90.38 10.91 90.38 70.91 150.38 70.91 160.38 80.91"/><g><polygon class="e" points="230.75 70.75 230.75 10.53 170.53 10.53 161.28 1.28 240 1.28 240 80 230.75 70.75"/><path class="f" d="M239.62,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="240.38 80.91 160.38 80.91 160.38 .91 170.38 10.91 170.38 70.91 230.38 70.91 240.38 80.91"/><g><polygon class="e" points="310.75 70.75 310.75 10.53 250.53 10.53 241.28 1.28 320 1.28 320 80 310.75 70.75"/><path class="f" d="M319.62,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="320.38 80.91 240.38 80.91 240.38 .91 250.38 10.91 250.38 70.91 310.38 70.91 320.38 80.91"/><g><polygon class="e" points="390.75 70.75 390.75 10.53 330.53 10.53 321.28 1.28 400 1.28 400 80 390.75 70.75"/><path class="f" d="M399.62,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="400.38 80.91 320.38 80.91 320.38 .91 330.38 10.91 330.38 70.91 390.38 70.91 400.38 80.91"/><g><polygon class="e" points="470.75 70.75 470.75 10.53 410.53 10.53 401.28 1.28 480 1.28 480 80 470.75 70.75"/><path class="f" d="M479.62,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="480.38 80.91 400.38 80.91 400.38 .91 410.38 10.91 410.38 70.91 470.38 70.91 480.38 80.91"/><g><polygon class="e" points="550.75 70.75 550.75 10.53 490.53 10.53 481.28 1.28 560 1.28 560 80 550.75 70.75"/><path class="f" d="M559.62,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="560.38 80.91 480.38 80.91 480.38 .91 490.38 10.91 490.38 70.91 550.38 70.91 560.38 80.91"/><g><polygon class="e" points="630.75 70.75 630.75 10.53 570.53 10.53 561.28 1.28 640 1.28 640 80 630.75 70.75"/><path class="f" d="M639.62,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="640.38 80.91 560.38 80.91 560.38 .91 570.38 10.91 570.38 70.91 630.38 70.91 640.38 80.91"/><g><polygon class="e" points="710.75 70.75 710.75 10.53 650.53 10.53 641.28 1.28 720 1.28 720 80 710.75 70.75"/><path class="f" d="M719.63,1.66V79.09l-8.5-8.5V10.16h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V.91h0Z"/></g><polygon class="g" points="720.38 80.91 640.38 80.91 640.38 .91 650.38 10.91 650.38 70.91 710.38 70.91 720.38 80.91"/><polygon class="g" points="80.38 160.91 .38 160.91 .38 80.91 10.38 90.91 10.38 150.91 70.38 150.91 80.38 160.91"/><g><polygon class="e" points="710.75 150.75 710.75 90.53 650.53 90.53 641.28 81.28 720 81.28 720 160 710.75 150.75"/><path class="f" d="M719.63,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><polygon class="g" points="720.38 160.91 640.38 160.91 640.38 80.91 650.38 90.91 650.38 150.91 710.38 150.91 720.38 160.91"/><polygon class="g" points="80.38 240.91 .38 240.91 .38 160.91 10.38 170.91 10.38 230.91 70.38 230.91 80.38 240.91"/><polygon class="g" points="160.38 240.91 80.38 240.91 80.38 160.91 90.38 170.91 90.38 230.91 150.38 230.91 160.38 240.91"/><polygon class="g" points="240.38 240.91 160.38 240.91 160.38 160.91 170.38 170.91 170.38 230.91 230.38 230.91 240.38 240.91"/><polygon class="g" points="320.38 240.91 240.38 240.91 240.38 160.91 250.38 170.91 250.38 230.91 310.38 230.91 320.38 240.91"/><polygon class="g" points="400.38 240.91 320.38 240.91 320.38 160.91 330.38 170.91 330.38 230.91 390.38 230.91 400.38 240.91"/><polygon class="g" points="480.38 240.91 400.38 240.91 400.38 160.91 410.38 170.91 410.38 230.91 470.38 230.91 480.38 240.91"/><polygon class="g" points="560.38 240.91 480.38 240.91 480.38 160.91 490.38 170.91 490.38 230.91 550.38 230.91 560.38 240.91"/><polygon class="g" points="640.38 240.91 560.38 240.91 560.38 160.91 570.38 170.91 570.38 230.91 630.38 230.91 640.38 240.91"/><g><polygon class="e" points="710.75 230.75 710.75 170.53 650.53 170.53 641.28 161.28 720 161.28 720 240 710.75 230.75"/><path class="f" d="M719.63,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><polygon class="g" points="720.38 240.91 640.38 240.91 640.38 160.91 650.38 170.91 650.38 230.91 710.38 230.91 720.38 240.91"/><g><polygon class="e" points="150.75 150.75 150.75 90.53 90.53 90.53 81.28 81.28 160 81.28 160 160 150.75 150.75"/><path class="f" d="M159.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75H80.37l10,10h60v60l10,10V80.91h0Z"/></g><g><polygon class="e" points="230.75 150.75 230.75 90.53 170.53 90.53 161.28 81.28 240 81.28 240 160 230.75 150.75"/><path class="f" d="M239.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><g><polygon class="e" points="310.75 150.75 310.75 90.53 250.53 90.53 241.28 81.28 320 81.28 320 160 310.75 150.75"/><path class="f" d="M319.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><g><polygon class="e" points="390.75 150.75 390.75 90.53 330.53 90.53 321.28 81.28 400 81.28 400 160 390.75 150.75"/><path class="f" d="M399.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><g><polygon class="e" points="470.75 150.75 470.75 90.53 410.53 90.53 401.28 81.28 480 81.28 480 160 470.75 150.75"/><path class="f" d="M479.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><g><polygon class="e" points="550.75 150.75 550.75 90.53 490.53 90.53 481.28 81.28 560 81.28 560 160 550.75 150.75"/><path class="f" d="M559.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><g><rect class="d" x="10.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M69.62,11.66v58.5H11.12V11.66h58.5m.75-.75H10.37v60h60V10.91h0Z"/></g><g><rect class="d" x="90.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M149.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="170.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M229.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="250.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M309.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="330.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M389.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="410.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M469.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="490.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M549.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="570.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M629.62,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="330.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M389.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="410.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M469.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="490.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M549.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="570.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M629.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="650.75" y="11.28" width="59.25" height="59.25"/><path class="f" d="M709.63,11.66v58.5h-58.5V11.66h58.5m.75-.75h-60v60h60V10.91h0Z"/></g><g><rect class="d" x="650.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M709.63,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="650.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M709.63,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="10.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M69.62,171.66v58.5H11.12v-58.5h58.5m.75-.75H10.37v60h60v-60h0Z"/></g><g><rect class="d" x="90.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M149.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="170.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M229.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="250.75" y="171.28" width="59.25" height="59.25"/><path class="f" d="M309.62,171.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><rect class="d" x="10.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M69.62,91.66v58.5H11.12v-58.5h58.5m.75-.75H10.37v60h60v-60h0Z"/></g><polygon class="g" points="240.38 160.91 160.38 160.91 160.38 80.91 170.38 90.91 170.38 150.91 230.38 150.91 240.38 160.91"/><g><rect class="d" x="170.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M229.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><polygon class="e" points="230.75 230.75 230.75 170.53 170.53 170.53 161.28 161.28 240 161.28 240 240 230.75 230.75"/><path class="f" d="M239.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><polygon class="g" points="400.38 160.91 320.38 160.91 320.38 80.91 330.38 90.91 330.38 150.91 390.38 150.91 400.38 160.91"/><g><rect class="d" x="330.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M389.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><polygon class="e" points="390.75 230.75 390.75 170.53 330.53 170.53 321.28 161.28 400 161.28 400 240 390.75 230.75"/><path class="f" d="M399.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><g><polygon class="e" points="70.75 150.75 70.75 90.53 10.53 90.53 1.28 81.28 80 81.28 80 160 70.75 150.75"/><path class="f" d="M79.62,81.66v77.44l-8.5-8.5v-60.44H10.69l-8.5-8.5H79.62m.75-.75H.37l10,10h60v60l10,10V80.91h0Z"/></g><polygon class="g" points="160.38 160.91 80.38 160.91 80.38 80.91 90.38 90.91 90.38 150.91 150.38 150.91 160.38 160.91"/><g><rect class="d" x="90.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M149.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><polygon class="e" points="150.75 230.75 150.75 170.53 90.53 170.53 81.28 161.28 160 161.28 160 240 150.75 230.75"/><path class="f" d="M159.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75H80.37l10,10h60v60l10,10v-80h0Z"/></g><g><polygon class="e" points="70.75 230.75 70.75 170.53 10.53 170.53 1.28 161.28 80 161.28 80 240 70.75 230.75"/><path class="f" d="M79.62,161.66v77.44l-8.5-8.5v-60.44H10.69l-8.5-8.5H79.62m.75-.75H.37l10,10h60v60l10,10v-80h0Z"/></g><polygon class="g" points="320.38 160.91 240.38 160.91 240.38 80.91 250.38 90.91 250.38 150.91 310.38 150.91 320.38 160.91"/><g><rect class="d" x="250.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M309.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><polygon class="e" points="310.75 230.75 310.75 170.53 250.53 170.53 241.28 161.28 320 161.28 320 240 310.75 230.75"/><path class="f" d="M319.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><polygon class="g" points="480.38 160.91 400.38 160.91 400.38 80.91 410.38 90.91 410.38 150.91 470.38 150.91 480.38 160.91"/><g><rect class="d" x="410.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M469.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><polygon class="e" points="470.75 230.75 470.75 170.53 410.53 170.53 401.28 161.28 480 161.28 480 240 470.75 230.75"/><path class="f" d="M479.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><polygon class="g" points="560.38 160.91 480.38 160.91 480.38 80.91 490.38 90.91 490.38 150.91 550.38 150.91 560.38 160.91"/><g><rect class="d" x="490.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M549.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g><g><polygon class="e" points="550.75 230.75 550.75 170.53 490.53 170.53 481.28 161.28 560 161.28 560 240 550.75 230.75"/><path class="f" d="M559.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><polygon class="g" points="640.38 160.91 560.38 160.91 560.38 80.91 570.38 90.91 570.38 150.91 630.38 150.91 640.38 160.91"/><g><polygon class="e" points="630.75 230.75 630.75 170.53 570.53 170.53 561.28 161.28 640 161.28 640 240 630.75 230.75"/><path class="f" d="M639.62,161.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10v-80h0Z"/></g><g><polygon class="e" points="630.75 150.75 630.75 90.53 570.53 90.53 561.28 81.28 640 81.28 640 160 630.75 150.75"/><path class="f" d="M639.62,81.66v77.44l-8.5-8.5v-60.44h-60.44l-8.5-8.5h77.44m.75-.75h-80l10,10h60v60l10,10V80.91h0Z"/></g><g><rect class="d" x="570.75" y="91.28" width="59.25" height="59.25"/><path class="f" d="M629.62,91.66v58.5h-58.5v-58.5h58.5m.75-.75h-60v60h60v-60h0Z"/></g></g></g></g></svg>`;
