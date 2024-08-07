
import { CacheService } from "@multiversx/sdk-nestjs-cache";
import { Locker } from "@multiversx/sdk-nestjs-common";
import { TransactionProcessor } from "@multiversx/sdk-transaction-processor";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CacheInfo, CommonConfigService, NetworkConfigService } from "@libs/common";
import { AppConfigService } from "../config/app-config.service";

@Injectable()
export class ProcessorService {
  private transactionProcessor: TransactionProcessor = new TransactionProcessor();
  private readonly logger: Logger;

  constructor(
    private readonly cacheService: CacheService,
    private readonly commonConfigService: CommonConfigService,
    private readonly appConfigService: AppConfigService,
    private readonly networkConfigService: NetworkConfigService,
  ) {
    this.logger = new Logger(ProcessorService.name);
  }

  @Cron('*/1 * * * * *')
  async handleNewTransactions() {
    await Locker.lock('newTransactions', async () => {
      await this.transactionProcessor.start({
        gatewayUrl: this.commonConfigService.config.urls.api,
        maxLookBehind: this.appConfigService.config.maxLookBehind,
        // eslint-disable-next-line require-await
        onTransactionsReceived: async (shardId, nonce, transactions, statistics) => {
          this.logger.log(`Received ${transactions.length} transactions on shard ${shardId} and nonce ${nonce}. Time left: ${statistics.secondsLeft}`);

          // for (const transaction of transactions) {
          //   const isLiquidLockingTransaction = transaction.receiver === this.networkConfigService.config.liquidlockingContract;
          //   if (isLiquidLockingTransaction && transaction.status === 'success') {
          //     const method = transaction.getDataFunctionName();

          //     switch (method) {
          //       case "unbond":
          //         await this.handleUnbondTransaction(transaction);
          //         break;
          //       default:
          //         break;
          //     }
          //   }
          // }
        },
        getLastProcessedNonce: async (shardId) => {
          return await this.cacheService.getRemote(CacheInfo.LastProcessedNonce(shardId).key);
        },
        setLastProcessedNonce: async (shardId, nonce) => {
          await this.cacheService.setRemote(CacheInfo.LastProcessedNonce(shardId).key, nonce, CacheInfo.LastProcessedNonce(shardId).ttl);
        },
      });
    });
  }

  // // eslint-disable-next-line require-await
  // private async handleUnbondTransaction(transaction: any): Promise<void> {
  //   console.log(transaction);
  // }
}
