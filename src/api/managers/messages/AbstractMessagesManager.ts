import {
  EntitiesCacheManager,
  Message,
  MessageContent,
  MessageCreateOptions,
  MessagesManagerData
} from '@src/api'
import { ChannelPinnedMessagesManager } from '@src/api/managers/messages/ChannelPinnedMessagesManager'
import { DiscordApplication } from '@src/core'
import { DiscordooError, resolveChannelId } from '@src/utils'
import { Keyspaces } from '@src/constants'
import { EntitiesManager } from '@src/api/managers/EntitiesManager'

export abstract class AbstractMessagesManager extends EntitiesManager {
  public cache: EntitiesCacheManager<Message>
  public pinned: ChannelPinnedMessagesManager
  public channelId: string
  public lastMessageId?: string

  constructor(app: DiscordApplication, data: MessagesManagerData) {
    super(app)

    const id = resolveChannelId(data.channel)
    if (!id) throw new DiscordooError('ChannelMessagesManager', 'Cannot operate without channel id.')
    this.channelId = id

    this.lastMessageId = data.lastMessageId

    this.cache = new EntitiesCacheManager<Message>(this.app, {
      keyspace: Keyspaces.Messages,
      storage: this.channelId,
      entity: 'Message',
      policy: 'messages'
    })

    this.pinned = new ChannelPinnedMessagesManager(this.app, {
      channel: this.channelId,
      lastPinTimestamp: data.lastPinTimestamp
    })
  }

  create(content: MessageContent, options?: MessageCreateOptions): Promise<Message | undefined> {
    return this.app.messages.create(this.channelId, content, options)
  }

  async last(): Promise<Message | undefined> {
    return this.lastMessageId ? this.cache.get(this.lastMessageId) : undefined
  }
}
