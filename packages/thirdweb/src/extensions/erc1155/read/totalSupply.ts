import { type TxOpts } from "~thirdweb/transaction/transaction.js";
import { readContract } from "~thirdweb/transaction/actions/read.js";

export type TotalSupplyParams = { tokenId: bigint };

/**
 * Retrieves the total supply of an ERC1155 token.
 * @param options - The transaction options.
 * @returns A promise that resolves to the total supply as a bigint.
 * @example
 * ```ts
 * import { totalSupply } from "thirdweb/extensions/erc1155";
 * const totalSupply = await totalSupply({ contract, tokenId: 1n });
 * ```
 */
export function totalSupply(
  options: TxOpts<TotalSupplyParams>,
): Promise<bigint> {
  return readContract({
    ...options,
    method: "function totalSupply(tokenId uint256) view returns (uint256)",
    params: [options.tokenId],
  });
}