import { EntitiesManager } from '@src/api/entities/managers/EntitiesManager'
import { Client } from '@src/core'
import { EntityKey, EntitiesCacheManagerData } from '@src/api/entities'
import {
  CacheManagerForEachOptions,
  CacheManagerDeleteOptions,
  CacheManagerFilterOptions,
  CacheManagerSweepOptions,
  CacheManagerSizeOptions,
  CacheManagerFindOptions,
  CacheManagerGetOptions,
  CacheManagerHasOptions,
  CacheManagerMapOptions,
  CacheManagerSetOptions,
  CachingOptions
} from '@src/cache/interfaces'
import { CacheProvider, CacheStorageKey } from '@discordoo/providers'

export class EntitiesCacheManager<Entity, EntityData = any> extends EntitiesManager {
  private readonly entityKey: EntityKey
  private readonly policy: keyof CachingOptions
  public readonly keyspace: string
  public readonly storage: CacheStorageKey

  constructor(client: Client, data: EntitiesCacheManagerData) {
    super(client)
    this.entityKey = data.entity
    this.keyspace = data.keyspace
    this.storage = data.storage
    this.policy = data.policy ?? 'global'
  }

  async delete(key: string[] | string, options?: CacheManagerDeleteOptions): Promise<boolean> {
    return this.client.internals.cache.delete<string>(this.keyspace, this.storage, key, options)
  }

  async filter(
    predicate: (value: Entity, key: string, provider: CacheProvider) => (boolean | Promise<boolean>),
    options?: CacheManagerFilterOptions
  ): Promise<Array<[ string, Entity ]>> {
    return this.client.internals.cache.filter<string, Entity>(
      this.keyspace,
      this.storage,
      this.entityKey,
      predicate,
      options,
    )
  }

  async find(
    predicate: (value: Entity, key: string, provider: CacheProvider) => (boolean | Promise<boolean>),
    options?: CacheManagerFindOptions
  ): Promise<Entity | undefined> {
    return this.client.internals.cache.find<string, Entity>(
      this.keyspace,
      this.storage,
      this.entityKey,
      predicate,
      options,
    )
  }

  async forEach(
    predicate: (value: Entity, key: string, provider: CacheProvider) => (unknown | Promise<unknown>),
    options?: CacheManagerForEachOptions
  ): Promise<void> {
    return this.client.internals.cache.forEach<string, Entity>(
      this.keyspace,
      this.storage,
      this.entityKey,
      predicate,
      options,
    )
  }

  async get(key: string, options?: CacheManagerGetOptions): Promise<Entity | undefined> {
    return this.client.internals.cache.get<string, Entity>(
      this.keyspace,
      this.storage,
      this.entityKey,
      key,
      options,
    )
  }

  async has(key: string, options?: CacheManagerHasOptions): Promise<boolean> {
    return this.client.internals.cache.has<string>(
      this.keyspace,
      this.storage,
      key,
      options,
    )
  }

  async map<R>(
    predicate: (value: Entity, key: string, provider: CacheProvider) => (R | Promise<R>),
    options?: CacheManagerMapOptions
  ): Promise<R[]> {
    return this.client.internals.cache.map<string, Entity, R>(
      this.keyspace,
      this.storage,
      this.entityKey,
      predicate,
      options,
    )
  }

  async set(key: string, value: Entity, options?: CacheManagerSetOptions): Promise<EntitiesCacheManager<Entity, EntityData>> {
    const allowed = this.client.internals.cache[Symbol.for('_ddooPoliciesProcessor')][this.policy](value)

    if (allowed) {
      await this.client.internals.cache.set<string, Entity>(
        this.keyspace,
        this.storage,
        this.entityKey,
        key,
        value,
        options,
      )
    }

    return this
  }

  async size(options?: CacheManagerSizeOptions): Promise<number> {
    return this.client.internals.cache.size(this.keyspace, this.storage, options)
  }

  async sweep(
    predicate: (value: Entity, key: string, provider: CacheProvider) => (boolean | Promise<boolean>),
    options?: CacheManagerSweepOptions
  ): Promise<void> {
    return this.client.internals.cache.sweep<string, Entity>(
      this.keyspace,
      this.storage,
      this.entityKey,
      predicate,
      options,
    )
  }
}