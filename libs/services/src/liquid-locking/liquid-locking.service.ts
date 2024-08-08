import { Injectable } from "@nestjs/common";
import { TokenIdentifier, TokenIdentifierList, UnbondPeriodOutput, UnlockedTokens, LockedTokenAmountsOutput, PaymentList, LockedTokensOutput } from "@libs/entities/entities/properties";
import { AbiRegistry, Address, QueryRunnerAdapter, SmartContractQueriesController, Transaction, TransactionComputer, SmartContractTransactionsFactory, Token, TokenTransfer, TransactionsFactoryConfig } from "@multiversx/sdk-core/out";
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


    // MODEL VIEW: FUNC CU CACHE CA MAI JOS + RAW
    // IN cachingService trebuie creata o structura pentru view cu key si ttl
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
            tokenIdentifier.token_identifier = tokenID.toString();
            return tokenIdentifier;
        });

        const tokenIdentifierList = new TokenIdentifierList();
        tokenIdentifierList.tokens = tokenIdentifiers;

        return tokenIdentifierList;
    }

    public async getLockedTokens(address: string): Promise<LockedTokensOutput[]> {
        return this.cachingService.getOrSet(
            CacheInfo.LockedTokens(address).key,
            async () => await this.getLockedTokensRaw(address),
            CacheInfo.LockedTokens(address).ttl
        )
    }

    private async getLockedTokensRaw(address: string): Promise<LockedTokensOutput[]> {
        const query = this.queriesController.createQuery({
            contract: this.networkConfigService.config.liquidlockingContract,
            function: "lockedTokens",
            arguments: [
                new Address(address)
            ]
        })

        const response = await this.queriesController.runQuery(query);
        const [lockedTokens] = this.queriesController.parseQueryResponse(response);

        console.log(lockedTokens);

        return lockedTokens;
    }

    public async getLockedTokenAmounts(address: string): Promise<LockedTokenAmountsOutput[]> {
        return this.cachingService.getOrSet(
            CacheInfo.LockedTokenAmounts(address).key,
            async () => await this.getLockedTokenAmountsRaw(address),
            CacheInfo.LockedTokenAmounts(address).ttl
        )
    }

    public async getLockedTokenAmountsRaw(address: string): Promise<LockedTokenAmountsOutput[]> {
        const query = this.queriesController.createQuery({
            contract: this.networkConfigService.config.liquidlockingContract,
            function: "lockedTokenAmounts",
            arguments: [
                new Address(address)
            ]
        })

        const response = await this.queriesController.runQuery(query);
        const [lockedTokenAmounts] = this.queriesController.parseQueryResponse(response);

        console.log(lockedTokenAmounts);

        return lockedTokenAmounts;
    }

    public async getUnlockedTokens(address: string): Promise<TokenIdentifierList> {
        return this.cachingService.getOrSet(
            CacheInfo.UnlockedTokens(address).key,
            async () => await this.getUnlockedTokensRaw(address),
            CacheInfo.UnlockedTokens(address).ttl,
        );
    }

    public async getUnlockedTokensRaw(address: string): Promise<TokenIdentifierList> {
        const query = this.queriesController.createQuery({
            contract: this.networkConfigService.config.liquidlockingContract,
            function: "unlockedTokens",
            arguments: [new Address(address)],
        });

        const response = await this.queriesController.runQuery(query);
        const unlockedTokens = this.queriesController.parseQueryResponse(response);
        console.log(unlockedTokens);
        const tokenIdentifierList = new TokenIdentifierList();
        tokenIdentifierList.tokens = unlockedTokens;
        return tokenIdentifierList;
    }

    public async getUnlockedTokenAmounts(address: string): Promise<UnlockedTokens> {
        return this.cachingService.getOrSet(
            CacheInfo.UnlockedTokensAmounts(address).key,
            async () => await this.getUnlockedTokenAmountsRaw(address),
            CacheInfo.UnlockedTokensAmounts(address).ttl,
        );
    }

    public async getUnlockedTokenAmountsRaw(address: string): Promise<UnlockedTokens> {
        const query = this.queriesController.createQuery({
            contract: this.networkConfigService.config.liquidlockingContract,
            function: "unlockedTokenAmounts",
            arguments: [new Address(address)],
        });

        const response = await this.queriesController.runQuery(query);
        const unlockedTokensAmounts = this.queriesController.parseQueryResponse(response);
        console.log(unlockedTokensAmounts);
        const unlockedTokens = new UnlockedTokens();
        unlockedTokens.tokens = unlockedTokensAmounts;
        return unlockedTokens;
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

    public generateLockTransaction(address: string, args: PaymentList): any {
        if (!args || !args.tokens || !Array.isArray(args.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokens = args.tokens.map(token => {
            const { token_identifier, token_nonce, amount } = token;
            return {
                token_identifier,
                token_nonce,
                amount,
            };
        });

        console.log("Tokens:", tokens);
        const esdtTokens = tokens.map(token => new TokenTransfer({
            token: new Token({
                identifier: token.token_identifier,
                nonce: BigInt(token.token_nonce),
            }),
            amount: BigInt(token.amount),
        }));

        console.log("ESDTTokens: ", esdtTokens);

        const transaction = this.createTransaction(address, [], "lock", esdtTokens);

        return transaction;
    }

    public generateUnlockTransaction(address: string, args: PaymentList): any {
        if (!args || !args.tokens || !Array.isArray(args.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokens = args.tokens.map(token => {
            const { token_identifier, token_nonce, amount } = token;
            return {
                token_identifier,
                token_nonce,
                amount,
            };
        });

        console.log("Tokens:", tokens);
        const wrappedTokens = [tokens];

        const transaction = this.createTransaction(address, wrappedTokens, "unlock", []);

        return transaction;
    }


    public generateUnbondTransaction(address: string, args: TokenIdentifierList): any {
        if (!args || !args.tokens || !Array.isArray(args.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokenIDs = args.tokens.map(token => token.token_identifier);
        const wrappedTokens = [tokenIDs];

        const transaction = this.createTransaction(address, wrappedTokens, "unbond", []);

        return transaction;
    }

    public generateLockTransactionFromBackend(address: string, body: PaymentList): Transaction {
        if (!body || !body.tokens || !Array.isArray(body.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokens = body.tokens.map(token => {
            const { token_identifier, token_nonce, amount } = token;
            return {
                token_identifier,
                token_nonce,
                amount,
            };
        });

        console.log("Tokens:", tokens);
        const esdtTokens = tokens.map(token => new TokenTransfer({
            token: new Token({
                identifier: token.token_identifier,
                nonce: BigInt(token.token_nonce),
            }),
            amount: BigInt(token.amount),
        }));


        const transaction = this.createTransactionFromBackend(address, [], "lock", esdtTokens);

        return transaction;
    }

    // [[{},{}]]
    public generateUnlockTransactionFromBackend(address: string, body: PaymentList): Transaction {
        if (!body || !body.tokens || !Array.isArray(body.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokens = body.tokens.map(token => {
            const { token_identifier, token_nonce, amount } = token;
            return {
                token_identifier,
                token_nonce,
                amount,
            };
        });

        console.log("Tokens:", tokens);
        const wrappedTokens = [tokens];

        console.log("Wrapped Tokens:", wrappedTokens);

        const transaction = this.createTransactionFromBackend(address, wrappedTokens, "unlock", []);

        return transaction;
    }

    public generateUnbondTransactionFromBackend(address: string, body: TokenIdentifierList): Transaction { // return any
        // Output bad
        if (!body || !body.tokens || !Array.isArray(body.tokens)) {
            throw new Error("Invalid body or tokens array");
        }

        const tokenIDs = body.tokens.map(token => token.token_identifier);
        // Output gud
        console.log('TokenIds List:', tokenIDs);
        const wrappedTokens = [tokenIDs];

        const transaction = this.createTransactionFromBackend(address, wrappedTokens, "unbond", []);

        return transaction;
    }

    public async sendLockTransaction(address: string, body: PaymentList) {
        const transaction = this.generateLockTransactionFromBackend(address, body);

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

    public async sendUnlockTransaction(address: string, body: PaymentList) {
        const transaction = this.generateUnlockTransactionFromBackend(address, body);
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

    public createTransaction(address: string, args: any[] | [], functionName: string, esdtTokens: TokenTransfer[] | []): any {
        const tx = this.transactionsFactory.createTransactionForExecute({
            sender: Address.fromBech32(address),
            contract: Address.fromBech32(this.networkConfigService.config.liquidlockingContract),
            function: functionName,
            gasLimit: BigInt(35_000_000),
            arguments: args,
            tokenTransfers: esdtTokens,
        }).toPlainObject();

        return tx;
    }

    public createTransactionFromBackend(address: string, args: any[] | [], functionName: string, esdtTokens: TokenTransfer[] | []): Transaction {
        const tx = this.transactionsFactory.createTransactionForExecute({
            sender: Address.fromBech32(address),
            contract: Address.fromBech32(this.networkConfigService.config.liquidlockingContract),
            function: functionName,
            gasLimit: BigInt(35_000_000),
            arguments: args,
            tokenTransfers: esdtTokens,
        });

        return tx;
    }

    async setUnbondPeriod(address: string, body: UnbondPeriodOutput): Promise<UnbondPeriodOutput> {
        const transaction = this.createTransaction(address, [body.unbondPeriod], "set_unbond_period", []);
        return transaction;
    }

    async addTokenToWhitelist(address: string, body: TokenIdentifier
    ): Promise<UnbondPeriodOutput> {
        const transaction = this.createTransaction(address, [body.token_identifier], "set_unbond_period", []);
        return transaction;
    }

    async addTokenToBlackList(address: string, body: TokenIdentifier
    ): Promise<UnbondPeriodOutput> {
        const transaction = this.createTransaction(address, [body.token_identifier], "set_unbond_period", []);
        return transaction;
    }
}
