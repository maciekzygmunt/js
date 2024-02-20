import { defineChain, type Chain } from "../../../../index.js";
import { privateKeyAccount } from "../../../index.js";
import type { Account, Wallet } from "../../../interfaces/wallet.js";
import type { StorageType, WalletStorageFormatType } from "../storage/type.js";
import type {
  AccountDetailType,
  CreateAccountOverrideType,
  SensitiveAccountDetailType,
} from "./type.js";

/**
 * Connect to Injected Wallet Provider
 * @param arg - The options for connecting to the embedded wallet Provider.
 * @param arg.storage - The storage options for the wallet sensitive information
 * @returns A Promise that resolves to a Wallet instance.
 * @throws Error if no injected provider is available or no accounts are available.
 * @example
 * ```ts
 * import { embeddedWallet } from "thirdweb/wallets";
 *
 * const storage = createManagedStorage({})
 * const wallet = await embeddedWallet({
 *  storage,
 * });
 *
 * ```
 */
export const embeddedWallet = async (arg: { storage: StorageType }) => {
  const wallet = new EmbeddedWallet({
    storage: arg.storage,
  });
  return wallet.initializeWallet();
};

class EmbeddedWallet implements Wallet {
  private storage: StorageType;
  private activeWalletAccountDetail: SensitiveAccountDetailType | null = null;
  private walletAccounts: Record<string, SensitiveAccountDetailType> = {};
  private chain: Chain;

  public metadata = {
    id: "embedded-wallet",
    name: "Embedded Wallet",
    iconUrl: "TODO",
  };

  address: string;

  constructor(arg: { storage: StorageType }) {
    this.storage = arg.storage;
    this.address = "";
    this.chain = defineChain(1); // chainId doesn't matter for embedded wallets
  }

  async initializeWallet() {
    const { getUserAccountDetail } = await import("./utils.js");
    const { EmbeddedWalletError } = await import("./error.js");

    if (!this.storage.authUser) {
      throw new Error(
        "Secret key for backend usage of embedded wallets is not implemented yet. Please use it with an authenticated user.",
      );
    }

    const accountDetails = await getUserAccountDetail({
      user: this.storage.authUser,
    });

    if (accountDetails.length === 0) {
      const newAccount = await this.createAccount();
      await this.saveAccount({
        account: newAccount,
      });
      this.setActiveAccount({
        account: newAccount,
      });
      return this;
    }

    const accountDetail = accountDetails[0];
    if (!accountDetail) {
      throw new EmbeddedWalletError(`BAD STATE: Wallets array is empty`);
    }
    const account = await this.loadAccount({
      account: accountDetail,
    });
    this.setActiveAccount({
      account: account,
    });
    return this;
  }

  async getAccountDetails() {
    const { getUserAccountDetail } = await import("./utils.js");
    if (!this.storage.authUser) {
      // todo: check secret key path
      return [];
    }
    const wallets = await getUserAccountDetail({
      user: this.storage.authUser,
    });
    return wallets;
  }

  private getPrivateKeyFromAccount(account: Account) {
    const privateKeySymbol = Object.getOwnPropertySymbols(account)[0];
    if (!privateKeySymbol) {
      return undefined;
    }
    return account[privateKeySymbol as unknown as "address"] as
      | string
      | undefined;
  }

  async createAccount(arg?: {
    createWalletOverride: CreateAccountOverrideType;
    formatOverride?: WalletStorageFormatType;
  }): Promise<Account> {
    const { createAccount } = await import("./utils.js");

    const wallet = await createAccount({
      createAccountOverride: arg?.createWalletOverride,
      client: this.storage.client,
      format: arg?.formatOverride ?? this.storage.defaultFormat,
      authUser: this.storage.authUser,
    });
    this.walletAccounts[wallet.address] = wallet;
    return privateKeyAccount({
      client: this.storage.client,
      privateKey: wallet.keyMaterial,
    });
  }

  async saveAccount(arg: {
    account: Account;
    update?: {
      format?: WalletStorageFormatType;
    };
    storageOverride?: StorageType;
  }) {
    const { saveAccount } = await import("./utils.js");
    const { EmbeddedWalletError } = await import("./error.js");

    const storage = arg.storageOverride ?? this.storage;

    let sensitiveAccountDetail = this.walletAccounts[arg.account.address];

    if (!sensitiveAccountDetail) {
      // outside account that is generated by the user outside of the createAccount function
      const privateKey = this.getPrivateKeyFromAccount(arg.account);
      if (!privateKey) {
        throw new EmbeddedWalletError(
          `Attempting to save an account that was not created by embeddedWallet({ ... }).createAccount() or privateKeyAccount(). ${arg.account.address}.`,
        );
      }
      await this.createAccount({
        createWalletOverride: () => {
          return {
            address: arg.account.address,
            privateKey: privateKey,
          };
        },
      });
      sensitiveAccountDetail = this.walletAccounts[arg.account.address];
      if (!sensitiveAccountDetail) {
        throw new EmbeddedWalletError(
          `BAD STATE: no account details resolved.`,
        );
      }
    }
    const newSensitiveAccountDetail = await saveAccount({
      accountDetail: {
        ...sensitiveAccountDetail,
        format: arg.update?.format ?? sensitiveAccountDetail.format,
      },
      storage,
    });
    // update the wallet details
    this.walletAccounts[newSensitiveAccountDetail.address] =
      newSensitiveAccountDetail;
    return arg.account;
  }

  async loadAccount({
    account,
    storageOverride,
  }: {
    account: AccountDetailType | Account;
    storageOverride?: StorageType;
  }): Promise<Account> {
    const { loadAccount } = await import("./utils.js");

    const storage = storageOverride ?? this.storage;

    let accountDetail = "format" in account ? account : undefined;

    if (!accountDetail) {
      const accountDetails = await this.getAccountDetails();
      accountDetail = accountDetails.find(
        (a) => a.address.toLowerCase() === account.address.toLowerCase(),
      );
      if (!accountDetail) {
        throw new Error(
          `Account not found. Please save the account ${account.address} before loading it.`,
        );
      }
    }

    const sensitiveAccountDetail = await loadAccount({
      accountDetail,
      storage,
    });
    this.walletAccounts[sensitiveAccountDetail.address] =
      sensitiveAccountDetail;

    return privateKeyAccount({
      client: storage.client,
      privateKey: sensitiveAccountDetail.keyMaterial,
    });
  }

  getAccount() {
    if (this.activeWalletAccountDetail) {
      return privateKeyAccount({
        client: this.storage.client,
        privateKey: this.activeWalletAccountDetail.keyMaterial,
      });
    }
    return;
  }

  async setActiveAccount(arg: { account: Account }) {
    const { EmbeddedWalletError } = await import("./error.js");

    if (this.walletAccounts[arg.account.address]) {
      const walletDetail = this.walletAccounts[arg.account.address];
      if (!walletDetail) {
        throw new Error(`BAD STATE: wallet is empty even after check.`);
      }
      this.activeWalletAccountDetail = walletDetail;
    } else {
      await this.createAccount({
        createWalletOverride: () => {
          const privateKey = this.getPrivateKeyFromAccount(arg.account);
          if (!privateKey) {
            throw new EmbeddedWalletError(
              `Attempting to set an active account that was not created by embeddedWallet({ ... }).createAccount() or privateKeyAccount(). ${arg.account.address}.`,
            );
          }
          return {
            address: arg.account.address,
            privateKey,
          };
        },
      });
      const walletDetail = this.walletAccounts[arg.account.address];
      if (!walletDetail) {
        throw new Error(`BAD STATE: wallet is empty even after initializing.`);
      }
      this.activeWalletAccountDetail = walletDetail;
    }
    this.address = arg.account.address;
    return arg.account;
  }

  public async connect() {
    return this.autoConnect();
  }

  public async autoConnect() {
    if (!this.activeWalletAccountDetail) {
      throw new Error("No active wallet");
    }

    return privateKeyAccount({
      client: this.storage.client,
      privateKey: this.activeWalletAccountDetail.keyMaterial,
    });
  }

  public async disconnect() {
    this.activeWalletAccountDetail = null;
  }

  getChain(): Chain {
    return this.chain;
  }

  async switchChain(newChain: Chain) {
    this.chain = newChain;
  }
}