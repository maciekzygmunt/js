"use client";
import type { Erc721Token } from "@/types/Erc721Token";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import {
  type Address,
  defineChain,
  getAddress,
  getContract,
  isAddress,
  sendTransaction,
} from "thirdweb";
import type { ChainMetadata } from "thirdweb/chains";
import { transferFrom } from "thirdweb/extensions/erc721";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import invariant from "tiny-invariant";
import { z } from "zod";
import { getChain } from "../lib/chains";
import { client } from "../lib/client";
import { ChainIcon } from "./ChainIcon";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Card from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";

export function NftLoadingCard() {
  return <Skeleton className="w-[300px] h-[300px]" />;
}

export default function NftCard({
  data,
}: { data: Erc721Token; width?: number; height?: number }) {
  const [open, setIsOpen] = React.useState(false);
  const { data: chainData } = useQuery({
    queryKey: ["chain-metadata", data.chainId],
    queryFn: async () => {
      return getChain(data.chainId.toString());
    },
    enabled: !!data.chainId,
  });
  console.log(chainData);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button type="button">
          <Card className="w-full h-[300px] group">
            <div className="absolute inset-0 object-cover w-full h-full bg-accent">
              {(data.image_url || data.collection.image_url) && (
                <Image
                  src={data.image_url || data.collection.image_url}
                  alt={data.name}
                  className="object-cover object-center"
                  fill
                />
              )}
            </div>
            <div className="relative z-10 flex flex-col items-stretch justify-between w-full h-full">
              <div className="flex items-center justify-end w-full transition-all -translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                {chainData && (
                  <ChainIcon
                    iconUrl={chainData.icon?.url}
                    className="w-7 h-7"
                  />
                )}
              </div>
              <div className="flex items-center justify-end w-full transition-all translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                <Badge>
                  {data.name ||
                    data.collection.name ||
                    data.contract.name ||
                    shortenAddress(data.contractAddress)}
                </Badge>
              </div>
            </div>
          </Card>
        </button>
      </DialogTrigger>
      <NftModal
        data={data}
        chainData={chainData}
        close={() => setIsOpen(false)}
      />
    </Dialog>
  );
}

const TransferFormSchema = z.object({
  recipient: z.string().refine((value) => isAddress(value), {
    message: "Invalid address",
  }),
});

function NftModal({
  data,
  chainData,
  close,
}: { data: Erc721Token; chainData?: ChainMetadata; close: () => void }) {
  const account = useActiveAccount();
  const params = useParams<{ address: string }>();

  const contract = useMemo(
    () =>
      getContract({
        client,
        address: data.contractAddress,
        chain: defineChain(data.chainId),
      }),
    [data.chainId, data.contractAddress],
  );

  const {
    mutateAsync: transfer,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (formData: z.infer<typeof TransferFormSchema>) => {
      invariant(account, "No account found");
      const transaction = transferFrom({
        contract,
        from: account?.address as Address,
        to: formData.recipient,
        tokenId: BigInt(data.tokenId),
      });

      return sendTransaction({ transaction, account });
    },
  });

  const form = useForm<z.infer<typeof TransferFormSchema>>({
    resolver: zodResolver(TransferFormSchema),
  });

  async function onSubmit(values: z.infer<typeof TransferFormSchema>) {
    await transfer(values);
    close();
  }

  return (
    <DialogContent className="sm:w-[425px] p-0 gap-0 rounded-2xl overflow-hidden">
      <div className="relative w-full h-[425px]">
        <Image
          src={data.image_url || data.collection.image_url}
          alt={data.name}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-col gap-6 p-6 border-t border-border">
        <DialogHeader className="grid grid-cols-4 gap-2 space-y-0">
          <div className="col-span-3">
            <DialogTitle>
              {data.name || data.collection.name || data.contract.name}
            </DialogTitle>
            <DialogDescription>
              {chainData?.explorers?.length ? (
                <Link
                  target="_blank"
                  className="hover:underline"
                  href={`${chainData.explorers[0].url}/address/${data.contractAddress}`}
                >
                  {shortenAddress(data.contractAddress)}
                </Link>
              ) : (
                shortenAddress(data.contractAddress)
              )}
            </DialogDescription>
          </div>
          <div className="flex items-start justify-end h-full col-span-1">
            <Badge variant="secondary">{chainData?.name}</Badge>
          </div>
        </DialogHeader>
        {account?.address === params.address && (
          <DialogFooter>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col w-full space-y-4"
              >
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Recipient address" {...field} />
                      </FormControl>
                      <FormMessage>{error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <Button disabled={isPending} type="submit">
                  {isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Transfer
                </Button>
              </form>
            </Form>
          </DialogFooter>
        )}
      </div>
    </DialogContent>
  );
}
