import { pack } from '@ethersproject/solidity'
import { Currency, Token } from '@uniswap/sdk-core'
import { Pool } from 'ramsesexchange-v3-sdk'
import { Pair } from 'ramsesexchange-v2-sdk'
import { MixedRouteSDK } from '../entities/mixedRoute/route'
import { V2_FEE_PATH_STABLE_PLACEHOLDER, V2_FEE_PATH_VOLATILE_PLACEHOLDER } from '../constants'

/**
 * Converts a route to a hex encoded path
 * @notice only supports exactIn route encodings
 * @param route the mixed path to convert to an encoded path
 * @returns the exactIn encoded path
 */
export function encodeMixedRouteToPath(route: MixedRouteSDK<Currency, Currency>): string {
  const firstInputToken: Token = route.input.wrapped

  const { path, types } = route.pools.reduce(
    (
      { inputToken, path, types }: { inputToken: Token; path: (string | number)[]; types: string[] },
      pool: Pool | Pair,
      index
    ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
      const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1 : pool.token0
      if (index === 0) {
        return {
          inputToken: outputToken,
          types: ['address', 'uint24', 'address'],
          path: [
            inputToken.address,
            pool instanceof Pool
              ? pool.fee
              : pool.stable
              ? V2_FEE_PATH_STABLE_PLACEHOLDER
              : V2_FEE_PATH_VOLATILE_PLACEHOLDER,
            outputToken.address,
          ],
        }
      } else {
        return {
          inputToken: outputToken,
          types: [...types, 'uint24', 'address'],
          path: [
            ...path,
            pool instanceof Pool
              ? pool.fee
              : pool.stable
              ? V2_FEE_PATH_STABLE_PLACEHOLDER
              : V2_FEE_PATH_VOLATILE_PLACEHOLDER,
            outputToken.address,
          ],
        }
      }
    },
    { inputToken: firstInputToken, path: [], types: [] }
  )

  return pack(types, path)
}
