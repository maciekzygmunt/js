import { getContract } from "~thirdweb/contract/index.js";
import { CLIENT_ID_CLIENT } from "./test-clients.js";
import { USDC_ABI } from "./abis/usdc.js";
import { FORKED_ETHEREUM_CHAIN } from "./chains.js";

export const USDC_CONTRACT_ADDRESS =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const USDC_CONTRACT = getContract({
  client: CLIENT_ID_CLIENT,
  address: USDC_CONTRACT_ADDRESS,
  chain: FORKED_ETHEREUM_CHAIN,
});

export const USDC_CONTRACT_WITH_ABI = getContract({
  client: CLIENT_ID_CLIENT,
  address: USDC_CONTRACT_ADDRESS,
  chain: FORKED_ETHEREUM_CHAIN,
  abi: USDC_ABI,
});