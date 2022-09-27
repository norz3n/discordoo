import { WebhookClient } from '@src/core/client/webhook/WebhookClient'
import { CompletedRestOptions, RestManagerData, RestManagerRequestData } from '@src/rest/interfaces'
import { RestFinishedResponse, RestProvider, RestRequestOptions } from '@discordoo/providers'
import { RestProviderConstructor } from '@src/core/providers/ProviderConstructor'
import { WebhookRestRequest } from '@src/rest/interfaces/RestRequest'
import { makeWebhookRequest } from '@src/rest/makeRequest'

export class WebhookRestManager<P extends RestProvider = RestProvider> {
  public client: WebhookClient
  public provider: P
  public options: CompletedRestOptions

  constructor(client: WebhookClient, Provider: RestProviderConstructor<P>, data: RestManagerData) {
    this.client = client
    this.options = data.restOptions
    this.provider = new Provider(this.client, data.restOptions, data.providerOptions)
  }

  api(): WebhookRestRequest {
    return makeWebhookRequest(this)
  }

  async request<T = any>(data: RestManagerRequestData, options: RestRequestOptions = {}): RestFinishedResponse<T> {
    return this.provider.request<T>({
      method: data.method,
      path: data.path,
      attachments: data.attachments ?? [],
      headers: data.headers,
      body: data.body,
    }, { ...options, useAuth: false })
  }

  async init(): Promise<void> {
    await this.provider.init()
  }

}