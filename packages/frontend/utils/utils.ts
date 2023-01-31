import { ICard } from "@/components/Card";
import { Contract } from "ethers";
import { CHAIN_ID } from "../config";

export function clipHash(hash: string) {
  return hash.slice(0, 6) + "..." + hash.slice(hash.length - 4, hash.length);
}

export function getTxn(hash: string) {
  switch (CHAIN_ID) {
    case 1:
      return `https://etherscan.io/tx/${hash}`;
    case 5:
      return `https://goerli.etherscan.io/tx/${hash}`;
    default:
      return `https://etherscan.io/tx/${hash}`;
  }
}

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

export function errorSlicing(error: string) {
  try {
    const left = error.indexOf("'");
    return error.slice(left + 1, error.length - 1);
  } catch (err) {
    return "Unexpected error";
  }
}

export async function getToken(
  contract: Contract,
  tokenId: number
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

export function isSVG(image: string): boolean {
  return image.includes(`<svg `);
}

export function throttle(
  callback: Function,
  throttleLock: boolean,
  cooldown: number = 1000
) {
  if (!throttleLock) {
    throttleLock = true;

    callback();

    setTimeout(() => {
      throttleLock = false;
    }, cooldown);
  }
}
