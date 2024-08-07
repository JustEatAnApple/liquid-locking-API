import { Injectable } from "@nestjs/common";
import { TokenIdentifier, TokenIdentifierList, UnbondPeriodOutput } from "@libs/entities/entities/properties";
import { AbiRegistry, Address, QueryRunnerAdapter, SmartContractQueriesController, SmartContractTransactionsFactory, Transaction, TransactionComputer, TransactionsFactoryConfig } from "@multiversx/sdk-core/out";
import abiLiquid from "./liquid-locking.abi.json";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { UserSigner } from "@multiversx/sdk-wallet"; // usually from frontend
import { CacheInfo, CommonConfigService, NetworkConfigService } from "@libs/common";
import { CacheService } from "@multiversx/sdk-nestjs-cache";
import { promises } from "fs";

@Injectable()
export class LiquidLockingService {
    private readonly queriesController: SmartContractQueriesController;
    private readonly transactionsFactory: SmartContractTransactionsFactory;

    constructor(
        private readonly networkConfigService: NetworkConfigService,
        readonly commonConfigService: CommonConfigService,
        private readonly cachingService: CacheService,
    ) {
        const abi = AbiRegistry.create(abiLiquid);
        const queryRunner = new QueryRunnerAdapter({
            networkProvider: new ApiNetworkProvider(commonConfigService.config.urls.api),
        });
        this.queriesController = new SmartContractQueriesController({
            abi,
            queryRunner,
        });

        this.transactionsFactory = new SmartContractTransactionsFactory({
            config: new TransactionsFactoryConfig({ chainID: networkConfigService.config.chainID }),
            abi,
        });
    }

    // eslint-disable-next-line require-await
    public async getWhitelistedTokens(): Promise<TokenIdentifierList> {
        return this.cachingService.getOrSet(
            CacheInfo.WhitelistedTokens().key,
            async () => await this.getWhitelistedTokensRaw(),
            CacheInfo.WhitelistedTokens().ttl,
        );
    }

    public async getWhitelistedTokensRaw(): Promise<TokenIdentifierList> {
        const query = this.queriesController.createQuery({
            // contract address
            contract: this.networkConfigService.config.liquidlockingContract,
            function: "whitelistedTokens",
            arguments: [],
        });

        const response = await this.queriesController.runQuery(query);
        const whitelistedTokensResponse = this.queriesController.parseQueryResponse(response);

        console.log(whitelistedTokensResponse);

        const tokenIdentifiers: TokenIdentifier[] = whitelistedTokensResponse.map((tokenID: any) => {
            const tokenIdentifier = new TokenIdentifier();
            tokenIdentifier.tokenID = tokenID.toString();
            return tokenIdentifier;
        });

        const tokenIdentifierList = new TokenIdentifierList();
        tokenIdentifierList.tokens = tokenIdentifiers;

        return tokenIdentifierList;
    }

    // eslint-disable-next-line require-await
    public async getUnbondPeriod(): Promise<UnbondPeriodOutput> {
        return this.cachingService.getOrSet(
            CacheInfo.UnbondPeriod().key,
            async () => await this.getUnbondPeriodRaw(),
            CacheInfo.UnbondPeriod().ttl,
        );
    }

    public async getUnbondPeriodRaw(): Promise<UnbondPeriodOutput> {
        const query = this.queriesController.createQuery({
            contract: this.networkConfigService.config.liquidlockingContract,
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

    public generateUnbondTransaction(address: string, body: TokenIdentifierList): any {
        // Output bad
        if (!body || !body.tokens || !Array.isArray(body.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokenIDs = body.tokens.map(token => token.tokenID);
        // Output gud
        console.log('TokenIds List:', tokenIDs);

        const transaction = this.transactionsFactory.createTransactionForExecute({
            sender: Address.fromBech32(address),
            contract: Address.fromBech32(this.networkConfigService.config.liquidlockingContract),
            function: "unbond",
            gasLimit: BigInt(35_000_000),
            arguments: [
                tokenIDs,
            ],
        }).toPlainObject();

        return transaction;
    }

    public generateUnbondTransactionFromBackend(address: string, body: TokenIdentifierList): Transaction { // return any
        // Output bad
        if (!body || !body.tokens || !Array.isArray(body.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokenIDs = body.tokens.map(token => token.tokenID);
        // Output gud
        console.log('TokenIds List:', tokenIDs);

        const transaction = this.transactionsFactory.createTransactionForExecute({
            sender: Address.fromBech32(address),
            contract: Address.fromBech32(this.networkConfigService.config.liquidlockingContract),
            function: "unbond",
            gasLimit: BigInt(35_000_000),
            arguments: [
                tokenIDs,
            ],
        });
        //.toPlainObject();

        return transaction;
    }

    public async sendUnbondTransaction(address: string, body: TokenIdentifierList) {
        const transaction = this.generateUnbondTransactionFromBackend(address, body);

        // Next nonce: 26824 -> de obicei din network provider get accountByAddress (are arg address)
        const pemText = await promises.readFile("/home/justeatanapple/ctfBlac.pem", { encoding: "utf8" });
        const networkProvider = new ApiNetworkProvider(this.commonConfigService.config.urls.api);
        const aux = await networkProvider.getAccount(Address.fromBech32(transaction.sender));
        transaction.nonce = BigInt(aux.nonce);
        const signer = UserSigner.fromPem(pemText);
        const computer = new TransactionComputer();
        const serializedTx = computer.computeBytesForSigning(transaction);
        transaction.signature = await signer.sign(serializedTx);

        console.log(transaction);

        const txHash = await networkProvider.sendTransaction(transaction);
        console.log("TX hash:", txHash);
    }
}
