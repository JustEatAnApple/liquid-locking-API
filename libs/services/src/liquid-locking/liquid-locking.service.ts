import { Injectable } from "@nestjs/common";
import { WhitelistedTokensOutput, UnbondPeriodOutput, TokenIdentifier, EsdtTokenPayment } from "@libs/entities/entities/properties";
import { AbiRegistry, Account, Address, QueryRunnerAdapter, SmartContractQueriesController, SmartContractTransactionsFactory, Transaction, TransactionComputer, TransactionsFactoryConfig } from "@multiversx/sdk-core/out";
import abiLiquid from "./liquid-locking.abi.json";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { CommonConfigService } from "@libs/common";
import { promises } from "fs";
import { UserSigner } from "@multiversx/sdk-wallet";

@Injectable()
export class LiquidLockingService {
    private readonly queriesController: SmartContractQueriesController;
    private readonly apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com");
    private readonly factory: SmartContractTransactionsFactory;
    private contractAddress = "erd1qqqqqqqqqqqqqpgqddpp8wafgz66v8xaknenxydqjy6rtnwu75pq0xjw03";
    private walletAddress = "erd1tjkfemhpxmch4vx306y85x2lv2n9d6hvn8qpe6atc7m82wef75pqmnws0t";

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
        this.factory = new SmartContractTransactionsFactory({
            config: new TransactionsFactoryConfig({ chainID: "D" }),
            abi: abi
        })
    }

    public async loadAbiFile() {
        let abiJson = await promises.readFile("liquid-locking.abi.json", { encoding: "utf8" });
        let abiObj = JSON.parse(abiJson);
        let abi = AbiRegistry.create(abiObj);
        return abi;
    }

    public async loadWallet(): Promise<UserSigner> {
        const pemText = await promises.readFile("/home/stefan/Desktop/mvx/liquid-locking-app/liquid-locking-API/libs/services/src/liquid-locking/ctfBlac.pem", { encoding: "utf8" });
        let signer = UserSigner.fromPem(pemText);
        return signer;
    }

    public async createTransaction(signer: UserSigner, args: any[] | [], functionName: string): Promise<Transaction> {
        // const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
        console.log(args)
        // const obj = { tokens: args }
        console.log([args]);
        const tx = this.factory.createTransactionForExecute({
            sender: signer.getAddress(),
            contract: Address.fromBech32(this.contractAddress),
            function: functionName,
            gasLimit: BigInt(35_000_000),
            arguments: [args],
        });


        const myAccount = new Account(signer.getAddress());
        const myAccountOnNetwork = await this.apiNetworkProvider.getAccount(signer.getAddress());
        myAccount.update(myAccountOnNetwork);

        tx.nonce = BigInt(myAccount.getNonceThenIncrement().valueOf())
        return tx;
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

    async getUnlockedTokens(): Promise<TokenIdentifier[]> {
        const query = this.queriesController.createQuery({
            contract: this.contractAddress,
            function: "unlockedTokens",
            arguments: [new Address(this.walletAddress)],
        });

        const response = await this.queriesController.runQuery(query);
        const unlockedTokens = this.queriesController.parseQueryResponse(response);
        console.log(unlockedTokens);
        return [new TokenIdentifier];
    }

    async getUnlockedTokenAmounts(): Promise<TokenIdentifier[]> {
        const query = this.queriesController.createQuery({
            contract: this.contractAddress,
            function: "unlockedTokenAmounts",
            arguments: [new Address(this.walletAddress)],
        });

        const response = await this.queriesController.runQuery(query);
        const unlockedTokensAmounts = this.queriesController.parseQueryResponse(response);
        console.log(unlockedTokensAmounts);

        return [new TokenIdentifier];

    }

    async unlockTokens(body: EsdtTokenPayment[]) {
        // let args = [EsdtTokenPayment];
        console.log(body[0].tokenID + " " + body[0].nonce + " " + body[0].amount)
        console.log(body);
        const args = body.map(item => ({ token_identifier: item.tokenID, token_nonce: item.nonce, amount: item.amount }));
        console.log(args);
        // console.log(body.map(item => console.log(item.tokenID, item.nonce, item.amount)));
        console.log("\n\n\n\n");
        let signer: UserSigner = await this.loadWallet();
        let tx = await this.createTransaction(signer, args, "unlock");
        const computer = new TransactionComputer();
        const serializedTx = computer.computeBytesForSigning(tx);

        tx.signature = await signer.sign(serializedTx);

        const txHash = await this.apiNetworkProvider.sendTransaction(tx);
        console.log("TX hash:", txHash);
    }
}
