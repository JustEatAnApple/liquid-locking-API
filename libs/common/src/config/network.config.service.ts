import { Injectable } from "@nestjs/common";
import { configuration } from "./configuration";

export interface NetworkConfig {
  chainID: 'D' | 'T' | '1';
  liquidlockingContract: string;
}

@Injectable()
export class NetworkConfigService {
  private readonly devnetConfig: NetworkConfig = {
    chainID: 'D',
    liquidlockingContract: "erd1qqqqqqqqqqqqqpgqddpp8wafgz66v8xaknenxydqjy6rtnwu75pq0xjw03",
  };
  private readonly testnetConfig: NetworkConfig = {
    chainID: 'T',
    liquidlockingContract: "",
  };
  private readonly mainnetConfig: NetworkConfig = {
    chainID: '1',
    liquidlockingContract: "",
  };

  public readonly config: NetworkConfig;

  constructor() {
    const network = configuration().libs.common.network;

    const networkConfigs = {
      devnet: this.devnetConfig,
      testnet: this.testnetConfig,
      mainnet: this.mainnetConfig,
    };

    this.config = networkConfigs[network];
  }
}
