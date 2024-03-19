import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { prepareContractCall } from "../../../../../transaction/prepare-contract-call.js";
import type { AbiParameterToPrimitiveType } from "abitype";

/**
 * Represents the parameters for the "exactOutputSingle" function.
 */
export type ExactOutputSingleParams = {
  params: AbiParameterToPrimitiveType<{
    type: "tuple";
    name: "params";
    components: [
      { type: "address"; name: "tokenIn" },
      { type: "address"; name: "tokenOut" },
      { type: "uint24"; name: "fee" },
      { type: "address"; name: "recipient" },
      { type: "uint256"; name: "deadline" },
      { type: "uint256"; name: "amountOut" },
      { type: "uint256"; name: "amountInMaximum" },
      { type: "uint160"; name: "sqrtPriceLimitX96" },
    ];
  }>;
};

/**
 * Calls the "exactOutputSingle" function on the contract.
 * @param options - The options for the "exactOutputSingle" function.
 * @returns A prepared transaction object.
 * @extension UNISWAP
 * @example
 * ```
 * import { exactOutputSingle } from "thirdweb/extensions/uniswap";
 *
 * const transaction = exactOutputSingle({
 *  params: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function exactOutputSingle(
  options: BaseTransactionOptions<ExactOutputSingleParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xdb3e2198",
      [
        {
          type: "tuple",
          name: "params",
          components: [
            {
              type: "address",
              name: "tokenIn",
            },
            {
              type: "address",
              name: "tokenOut",
            },
            {
              type: "uint24",
              name: "fee",
            },
            {
              type: "address",
              name: "recipient",
            },
            {
              type: "uint256",
              name: "deadline",
            },
            {
              type: "uint256",
              name: "amountOut",
            },
            {
              type: "uint256",
              name: "amountInMaximum",
            },
            {
              type: "uint160",
              name: "sqrtPriceLimitX96",
            },
          ],
        },
      ],
      [
        {
          type: "uint256",
          name: "amountIn",
        },
      ],
    ],
    params: [options.params],
  });
}