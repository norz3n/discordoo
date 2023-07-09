import { ProviderOption } from '@src/core'
import { CompletedGatewayOptions, GatewayOptions } from '@src/gateway'
import { CacheOptions } from '@src/cache/interfaces/CacheOptions'
import { RestOptions } from '@src/rest/interfaces/RestOptions'
import { ExtendedEntityOption } from '@src/core/apps/ExtendedEntityOption'
import { CompletedLocalIpcOptions } from '@src/sharding/CompletedLocalIpcOptions'
import { CompletedCacheOptions } from '@src/cache'
import { CompletedRestOptions } from '@src/rest'

export interface ApplicationOptions<CustomOptions = any> {
  providers?: ProviderOption[]
  gateway?: GatewayOptions
  cache?: CacheOptions
  rest?: RestOptions
  ipc?: CompletedLocalIpcOptions
  custom?: CustomOptions
  extenders?: ExtendedEntityOption[]
}

export interface CompletedClientOptions {
  gateway: CompletedGatewayOptions
  cache: CompletedCacheOptions
  rest: CompletedRestOptions
  ipc: CompletedLocalIpcOptions
}