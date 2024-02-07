export { ConnectWallet } from "./ui/ConnectWallet/ConnectWallet.js";
export {
  TransactionButton,
  type TransactionButtonProps,
} from "./ui/TransactionButton/index.js";

export { ThirdwebProvider } from "./providers/thirdweb-provider.js";

export {
  useSetActiveAccount,
  useActiveWalletChainId,
  useConnect,
  useDisconnect,
  useActiveAccount,
  useConnectedAccounts,
  useSwitchActiveWalletChain,
  useActiveWalletConnectionStatus,
  useSetActiveWalletConnectionStatus,
  useIsAutoConnecting,
} from "./providers/wallet-provider.js";

// contract related
export {
  useReadContract,
  // deprecated, use useReadContract instead
  useContractRead,
} from "./hooks/contract/useRead.js";
export { useSendTransaction } from "./hooks/contract/useSend.js";
export { useEstimateGas } from "./hooks/contract/useEstimate.js";
export { useWaitForReceipt } from "./hooks/contract/useWaitForReceipt.js";
export { useContractEvents } from "./hooks/contract/useContractEvents.js";

// rpc related
export { useBlockNumber } from "./hooks/rpc/useBlockNumber.js";

// utils
export { createContractQuery } from "./utils/createQuery.js";
