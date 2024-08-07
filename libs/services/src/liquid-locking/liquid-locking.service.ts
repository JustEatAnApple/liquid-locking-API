import { Injectable } from "@nestjs/common";
import { WhitelistedTokensOutput, UnbondPeriodOutput } from "@libs/entities/entities/properties";
import { AbiRegistry, QueryRunnerAdapter, SmartContractQueriesController } from "@multiversx/sdk-core/out";
import abiLiquid from "./liquid-locking.abi.json";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { CommonConfigService } from "@libs/common";

@Injectable()
export class LiquidLockingService {
    readonly queriesController: SmartContractQueriesController;

    constructor(
        readonly commonConfigService: CommonConfigService,
    ) {
        const abi = AbiRegistry.create(abiLiquid);
        const queryRunner = new QueryRunnerAdapter({
            networkProvider: new ApiNetworkProvider(commonConfigService.config.urls.api),
        });
        this.queriesController = new SmartContractQueriesController({
            abi,
            queryRunner,
        });
    }

    public async getWhitelistedTokens(): Promise<WhitelistedTokensOutput[]> {
        const query = this.queriesController.createQuery({
            // contract address
            contract: "erd1qqqqqqqqqqqqqpgqddpp8wafgz66v8xaknenxydqjy6rtnwu75pq0xjw03",
            function: "whitelistedTokens",
            arguments: [],
        });

        const response = await this.queriesController.runQuery(query);
        const [whitelistedTokens] = this.queriesController.parseQueryResponse(response);

        console.log(whitelistedTokens);

        return whitelistedTokens;

    }

    public async getUnbondPeriod(): Promise<UnbondPeriodOutput> {
        const query = this.queriesController.createQuery({
            contract: "erd1qqqqqqqqqqqqqpgqddpp8wafgz66v8xaknenxydqjy6rtnwu75pq0xjw03",
            function: "unbondPeriod",
            arguments: [],
        });

        const response = await this.queriesController.runQuery(query);
        const unbondPeriod = this.queriesController.parseQueryResponse(response);

        const unbondPeriodNumber: number = Number(unbondPeriod);

        console.log(unbondPeriod);

        const unbondPeriodOutput = new UnbondPeriodOutput();
        unbondPeriodOutput.unbondPeriod = unbondPeriodNumber;

        return unbondPeriodOutput;

    }
}
