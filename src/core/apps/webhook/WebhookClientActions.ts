import { WebhookClient } from '@src/core/apps/webhook/WebhookClient'
import { RawExecuteWebhookQuery } from '@src/core/apps/webhook/RawExecuteWebhookQuery'
import { Endpoints } from '@src/constants'
import { WebhookMessageCreateData } from '@src/api/entities/message/interfaces/MessageCreateData'
import { RestFinishedResponse } from '@discordoo/providers'
import { RawMessageData } from '@src/api'

export class WebhookClientActions {
  public app: WebhookClient

  constructor(app: WebhookClient) {
    this.app = app
  }

  async createMessage(data: WebhookMessageCreateData, query: RawExecuteWebhookQuery = {}): RestFinishedResponse<RawMessageData> {
    const request = this.app.internals.rest.api()
      .url(Endpoints.WEBHOOK_TOKEN(this.app.id, this.app.token))
      .query(query)

    if (data.files?.length) {
      request.attach(...data.files)
    }

    request.body({
      content: data.content,
      username: data.username,
      avatar_url: data.avatar_url,
      tts: data.tts,
      embeds: data.embeds?.length ? data.embeds : undefined,
      allowed_mentions: data.allowed_mentions,
      thread_name: data.thread_name,
    })

    return request.post()
  }

  async getMessage(messageId: string, threadId?: string) {
    return this.app.internals.rest.api()
      .url(Endpoints.WEBHOOK_MESSAGE(this.app.id, this.app.token, messageId))
      .query({ thread_id: threadId })
      .get()
  }

  async deleteMessage(messageId: string, threadId?: string, reason?: string) {
    return this.app.internals.rest.api()
      .url(Endpoints.WEBHOOK_MESSAGE(this.app.id, this.app.token, messageId))
      .query({ thread_id: threadId })
      .delete({ reason })
  }
}