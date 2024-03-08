import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { prepareContractCall } from "../../../../../transaction/prepare-contract-call.js";
import type { AbiParameterToPrimitiveType } from "abitype";

/**
 * Represents the parameters for the "claim" function.
 */
export type ClaimParams = {
  receiver: AbiParameterToPrimitiveType<{ type: "address"; name: "receiver" }>;
  quantity: AbiParameterToPrimitiveType<{ type: "uint256"; name: "quantity" }>;
  currency: AbiParameterToPrimitiveType<{ type: "address"; name: "currency" }>;
  pricePerToken: AbiParameterToPrimitiveType<{
    type: "uint256";
    name: "pricePerToken";
  }>;
  allowlistProof: AbiParameterToPrimitiveType<{
    type: "tuple";
    name: "allowlistProof";
    components: [
      { type: "bytes32[]"; name: "proof" },
      { type: "uint256"; name: "maxQuantityInAllowlist" },
    ];
  }>;
  data: AbiParameterToPrimitiveType<{ type: "bytes"; name: "data" }>;
};

/**
 * Calls the "claim" function on the contract.
 * @param options - The options for the "claim" function.
 * @returns A prepared transaction object.
 * @extension ERC20
 * @example
 * ```
 * import { claim } from "thirdweb/extensions/erc20";
 *
 * const transaction = claim({
 *  receiver: ...,
 *  quantity: ...,
 *  currency: ...,
 *  pricePerToken: ...,
 *  allowlistProof: ...,
 *  data: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claim(options: BaseTransactionOptions<ClaimParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x5ab31c1a",
      [
        {
          type: "address",
          name: "receiver",
        },
        {
          type: "uint256",
          name: "quantity",
        },
        {
          type: "address",
          name: "currency",
        },
        {
          type: "uint256",
          name: "pricePerToken",
        },
        {
          type: "tuple",
          name: "allowlistProof",
          components: [
            {
              type: "bytes32[]",
              name: "proof",
            },
            {
              type: "uint256",
              name: "maxQuantityInAllowlist",
            },
          ],
        },
        {
          type: "bytes",
          name: "data",
        },
      ],
      [],
    ],
    params: [
      options.receiver,
      options.quantity,
      options.currency,
      options.pricePerToken,
      options.allowlistProof,
      options.data,
    ],
  });
}