import { Constants } from "@multiversx/sdk-nestjs-common";

export class CacheInfo {
  key: string = "";
  ttl: number = Constants.oneSecond() * 6;


  // Exemplu cu variabila cum ar veni cand ai endpoint cu /$address/endpoint
  static LastProcessedNonce(shardId: number): CacheInfo {
    return {
      key: `lastProcessedNonce:${shardId}`,
      ttl: Constants.oneMonth(),
    };
  }

  // Exemplu simplu
  static Examples: CacheInfo = {
    key: "examples",
    ttl: Constants.oneHour(),
  };

  static WhitelistedTokens(): CacheInfo {
    return {
      key: "whitelistedTokens",
      ttl: Constants.oneSecond() * 5,
    };
  }

  static UnbondPeriod(): CacheInfo {
    return {
      key: "unbondPeriod",
      ttl: Constants.oneSecond() * 5,
    };
  }

  static UnlockedTokens(address: string): CacheInfo {
    return {
      key: "UnlockedTokens-" + address,
      ttl: Constants.oneSecond() * 5,
    };
  }

  static UnlockedTokensAmounts(address: string): CacheInfo {
    return {
      key: "UnlockedTokensAmounts-" + address,
      ttl: Constants.oneSecond() * 5,
    };
  }

  static LockedTokens(address: string): CacheInfo{
    return {
      key: "LockedTokens-" + address,
      ttl: Constants.oneSecond() * 5
    }
  }

  static LockedTokenAmounts(address: string): CacheInfo{
    return {
      key: "LockedTokenAmounts-" + address,
      ttl: Constants.oneSecond() * 5
    }
  }
}
