import { apiKeys } from "@3rdweb-sdk/react";
import { type ApiKey, useApiKeys } from "@3rdweb-sdk/react/hooks/useApi";
import { useLoggedInUser } from "@3rdweb-sdk/react/hooks/useLoggedInUser";
import { Flex } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "components/app-layouts/app";
import { PayConfig } from "components/pay/PayConfig";
import { ApiKeysMenu } from "components/settings/ApiKeys/Menu";
import { NoApiKeys } from "components/settings/ApiKeys/NoApiKeys";
import { ConnectWalletPrompt } from "components/settings/ConnectWalletPrompt";
import { ConnectSidebar } from "core-ui/sidebar/connect";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "../../../@/components/ui/Spinner/Spinner";
import { TabButtons } from "../../../@/components/ui/tabs";
import { PayAnalytics } from "../../../components/pay/PayAnalytics/PayAnalytics";
import { PageId } from "../../../page-id";
import { TrackedLink } from "../../../tw-components";
import type { ThirdwebNextPage } from "../../../utils/types";

const TRACKING_CATEGORY = "pay";

function usePayConfig() {
  const router = useRouter();
  const defaultClientId = router.query.clientId?.toString();
  const { user } = useLoggedInUser();
  const queryClient = useQueryClient();

  const [selectedKey_, setSelectedKey] = useState<undefined | ApiKey>();

  const keysQuery = useApiKeys();
  const apiKeysData = useMemo(
    () =>
      (keysQuery?.data ?? []).filter((key) => {
        return !!(key.services ?? []).find((srv) => srv.name === "pay");
      }),
    [keysQuery?.data],
  );
  const hasPayApiKeys = apiKeysData.length > 0;

  // FIXME: this seems like a deeper problem, solve later
  // eslint-disable-next-line no-restricted-syntax
  useEffect(() => {
    // query rehydrates from cache leading to stale results if user refreshes shortly after updating their dashboard.
    // Invalidate the query to force a refetch
    if (user?.address) {
      queryClient.invalidateQueries(apiKeys.keys(user?.address));
    }
  }, [queryClient, user?.address]);

  //  compute the actual selected key based on if there is a state, if there is a query param, or otherwise the first one
  const selectedKey = useMemo(() => {
    if (selectedKey_) {
      return selectedKey_;
    }
    if (apiKeysData.length) {
      if (defaultClientId) {
        return apiKeysData.find((k) => k.key === defaultClientId);
      }
      return apiKeysData[0];
    }
    return undefined;
  }, [apiKeysData, defaultClientId, selectedKey_]);

  return {
    hasPayApiKeys,
    selectedKey,
    setSelectedKey,
    apiKeysData,
    hasApiKeys: !!keysQuery.data?.length,
    isFetchingKeys: keysQuery.isFetching && !keysQuery.isRefetching,
  };
}

const DashboardConnectPay: ThirdwebNextPage = () => {
  const { isLoggedIn, isLoading } = useLoggedInUser();
  const {
    hasApiKeys,
    hasPayApiKeys,
    selectedKey,
    setSelectedKey,
    apiKeysData,
    isFetchingKeys,
  } = usePayConfig();
  // Pay setting api key configuration

  if (isLoading || isFetchingKeys) {
    return (
      <div className="min-h-[calc(100vh-300px)] lg:min-h-[calc(100vh-250px)] flex items-center justify-center">
        <Spinner className="size-14" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <ConnectWalletPrompt description="manage your Pay configuration" />;
  }

  return (
    <Flex flexDir="column" gap={8}>
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
        <div className="max-w-[800px]">
          <h1 className="text-5xl tracking-tight font-bold mb-5">Pay</h1>
          <p className="text-secondary-foreground leading-7">
            Pay allows your users to purchase cryptocurrencies and execute
            transactions with their credit card or debit card, or with any token
            via cross-chain routing.{" "}
            <TrackedLink
              isExternal
              category={TRACKING_CATEGORY}
              href="https://portal.thirdweb.com/connect/pay/overview"
              label="pay-docs"
              className="!text-link-foreground"
            >
              Learn more
            </TrackedLink>
          </p>
        </div>

        <div className="w-full lg:max-w-[300px]">
          {hasPayApiKeys && selectedKey && (
            <ApiKeysMenu
              apiKeys={apiKeysData}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
            />
          )}
        </div>
      </div>

      <PayUI
        hasPayApiKeys={hasPayApiKeys}
        hasApiKeys={hasApiKeys}
        selectedKey={selectedKey}
      />
    </Flex>
  );
};

function PayUI(props: {
  hasPayApiKeys: boolean;
  hasApiKeys: boolean;
  selectedKey: ApiKey | undefined;
}) {
  const { hasPayApiKeys, hasApiKeys, selectedKey } = props;
  const [activeTab, setActiveTab] = useState<"settings" | "analytics">(
    "analytics",
  );

  return (
    <div>
      {!hasPayApiKeys && (
        <NoApiKeys
          service="Pay in Connect"
          buttonTextOverride={hasApiKeys ? "Enable Pay" : undefined}
          copyOverride={
            hasApiKeys
              ? "You'll need to enable pay as a service in an API Key to use Pay."
              : undefined
          }
        />
      )}

      {hasPayApiKeys && selectedKey && (
        <>
          <TabButtons
            tabs={[
              {
                name: "Analytics",
                isActive: activeTab === "analytics",
                onClick: () => setActiveTab("analytics"),
                isEnabled: true,
              },
              {
                name: "Settings",
                isActive: activeTab === "settings",
                onClick: () => setActiveTab("settings"),
                isEnabled: true,
              },
            ]}
          />

          <div className="h-5" />
          {activeTab === "settings" && <PayConfig apiKey={selectedKey} />}
          {activeTab === "analytics" && <PayAnalytics apiKey={selectedKey} />}
        </>
      )}
    </div>
  );
}

DashboardConnectPay.getLayout = (page, props) => (
  <AppLayout {...props} hasSidebar={true}>
    <ConnectSidebar activePage="pay-settings" />
    {page}
  </AppLayout>
);

DashboardConnectPay.pageId = PageId.DashboardConnectPay;

export default DashboardConnectPay;
