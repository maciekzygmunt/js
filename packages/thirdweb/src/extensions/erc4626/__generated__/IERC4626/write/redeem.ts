import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { prepareContractCall } from "../../../../../transaction/prepare-contract-call.js";
import type { AbiParameterToPrimitiveType } from "abitype";
import type { Prettify } from "../../../../../utils/type-utils.js";

/**
 * Represents the parameters for the "redeem" function.
 */

type RedeemParamsInternal = {
  shares: AbiParameterToPrimitiveType<{
    name: "shares";
    type: "uint256";
    internalType: "uint256";
  }>;
  receiver: AbiParameterToPrimitiveType<{
    name: "receiver";
    type: "address";
    internalType: "address";
  }>;
  owner: AbiParameterToPrimitiveType<{
    name: "owner";
    type: "address";
    internalType: "address";
  }>;
};

export type RedeemParams = Prettify<
  | RedeemParamsInternal
  | {
      asyncParams: () => Promise<RedeemParamsInternal>;
    }
>;
/**
 * Calls the "redeem" function on the contract.
 * @param options - The options for the "redeem" function.
 * @returns A prepared transaction object.
 * @extension ERC4626
 * @example
 * ```
 * import { redeem } from "thirdweb/extensions/erc4626";
 *
 * const transaction = redeem({
 *  shares: ...,
 *  receiver: ...,
 *  owner: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function redeem(options: BaseTransactionOptions<RedeemParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xba087652",
      [
        {
          name: "shares",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "receiver",
          type: "address",
          internalType: "address",
        },
        {
          name: "owner",
          type: "address",
          internalType: "address",
        },
      ],
      [
        {
          name: "assets",
          type: "uint256",
          internalType: "uint256",
        },
      ],
    ],
    params:
      "asyncParams" in options
        ? async () => {
            const resolvedParams = await options.asyncParams();
            return [
              resolvedParams.shares,
              resolvedParams.receiver,
              resolvedParams.owner,
            ] as const;
          }
        : [options.shares, options.receiver, options.owner],
  });
}
