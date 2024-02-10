import type {
  Abi,
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunctionNames,
} from "abitype";
import {
  prepareTransaction,
  type Transaction,
  type TransactionOptions,
} from "../transaction.js";
import { encode } from "./encode.js";
import { resolveAbiFunction } from "./resolve-abi.js";
import { readTransactionRaw } from "./raw/raw-read.js";

/**
 * Reads data from a smart contract.
 * @param options - The transaction options.
 * @returns A promise that resolves with the result of the read transaction.
 * @transaction
 * @example
 * ```ts
 * import { readContract } from "thirdweb";
 * const result = await readContract({
 *  contract,
 *  method: "totalSupply",
 * });
 * ```
 */
export async function readContract<
  const abi extends Abi,
  // if an abi has been passed into the contract, restrict the method to function names of the abi
  const method extends abi extends { length: 0 }
    ? AbiFunction | string
    : ExtractAbiFunctionNames<abi>,
>(options: TransactionOptions<abi, method>) {
  return readTransaction(prepareTransaction(options));
}

export type ReadOutputs<abiFn extends AbiFunction> = // if the outputs are 0 length, return never, invalid case
  abiFn["outputs"] extends { length: 0 }
    ? never
    : abiFn["outputs"] extends { length: 1 }
      ? // if the outputs are 1 length, we'll always return the first element
        AbiParametersToPrimitiveTypes<abiFn["outputs"]>[0]
      : // otherwise we'll return the array
        AbiParametersToPrimitiveTypes<abiFn["outputs"]>;

/**
 * Reads the result of a transaction from the blockchain.
 * @param transaction - The transaction to read.
 * @returns A promise that resolves to the decoded output of the transaction.
 * @example
 * ```ts
 * import { readTransaction } from "thirdweb";
 * const result = await readTransaction(tx);
 * ```
 */
export async function readTransaction<const abiFn extends AbiFunction>(
  transaction: Transaction<abiFn>,
): Promise<ReadOutputs<abiFn>> {
  const [encodedData, resolvedAbiFunction] = await Promise.all([
    encode(transaction),
    resolveAbiFunction(transaction),
  ]);

  if (!resolvedAbiFunction) {
    throw new Error("Unable to resolve ABI function");
  }

  return readTransactionRaw<abiFn>({
    transaction,
    abiFunction: resolvedAbiFunction as abiFn,
    encodedData,
  });
}