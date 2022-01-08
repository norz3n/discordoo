import { AbstractGuildChannel } from '@src/api/entities/channel/AbstractGuildChannel'
import { CategoryChannelChildrenManager } from '@src/api/managers/channels/CategoryChannelChildrenManager'
import { AbstractGuildChannelData } from '@src/api/entities/channel/interfaces/AbstractGuildChannelData'
import { RawAbstractGuildChannelData } from '@src/api/entities/channel/interfaces/RawAbstractGuildChannelData'
import { Keyspaces } from '@src/constants'
import { AnyGuildChannel } from '@src/api/entities/channel/interfaces/AnyGuildChannel'
import { makeCachePointer } from '@src/utils/cachePointer'

export class GuildCategoryChannel extends AbstractGuildChannel {
  public children!: CategoryChannelChildrenManager

  async init(data: AbstractGuildChannelData | RawAbstractGuildChannelData): Promise<this> {
    await super.init(data)

    if (!this.children) {
      this.children = new CategoryChannelChildrenManager(this.client, {
        category: this.id,
        guild: this.guildId
      })
    }

    await this.children.cache.clear()

    const predicate = async (channel: AnyGuildChannel) => {
      if (channel.parentId === this.id) {
        await this.children.cache.set(channel.id, makeCachePointer(Keyspaces.CHANNELS, 'global', channel.id))
      }
    }

    await this.client.internals.cache.forEach(
      Keyspaces.CHANNELS,
      this.guildId,
      'channelEntityKey',
      predicate
    )

    return this
  }
}