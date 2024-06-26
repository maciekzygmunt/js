import { ChainCombobox } from "@/components/ChainCombobox";
import { client } from "@/lib/client";
import { resolveName } from "thirdweb/extensions/ens";
import { shortenAddress } from "thirdweb/utils";
import { getChains } from "../../../../../lib/chains";
import { SIMPLEHASH_NFT_SUPPORTED_CHAIN_IDS } from "../../../../../util/simplehash";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { ecosystem: string; address: string };
}) {
  let ens: string | null = null;
  try {
    ens = await resolveName({
      client,
      address: params.address,
    });
  } catch (e) {
    console.log(e);
  }

  const thirdwebChains = await getChains();
  const simpleHashChains = thirdwebChains.filter((chain) =>
    SIMPLEHASH_NFT_SUPPORTED_CHAIN_IDS.includes(chain.chainId),
  );

  return (
    <div className="flex flex-col w-full my-32">
      <div className="flex items-end justify-between w-full mb-8">
        <h2 className="text-3xl font-bold">
          {ens || shortenAddress(params.address)}
        </h2>
        <ChainCombobox chains={simpleHashChains} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
