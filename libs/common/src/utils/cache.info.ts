import { Constants } from "@multiversx/sdk-nestjs-common";

export class CacheInfo {
  key: string = "";
  ttl: number = Constants.oneSecond() * 6;

  static LastProcessedNonce(shardId: number): CacheInfo {
    return {
      key: `lastProcessedNonce:${shardId}`,
      ttl: Constants.oneMonth(),
    };
  }

  static Examples: CacheInfo = {
    key: "examples",
    ttl: Constants.oneHour(),
  };

  static WhitelistedTokens(): CacheInfo {
    return {
      key: "whitelistedTokens",
      ttl: Constants.oneHour(),
    };
  }

  static UnbondPeriod(): CacheInfo {
    return {
      key: "unbondPeriod",
      ttl: Constants.oneHour(),
    };
  }
}
