import { ValidationError } from '@src/utils'
import { is } from 'typescript-is'
import { CreateWebhookData } from '@src/wrapper/interfaces/CreateWebhookData'
import { CreateAppOptions } from '@src/wrapper/interfaces'
import { WebhookClientOptions } from '@src/core/apps/webhook/WebhookClientOptions'
import { ProviderConstructor } from '@src/core'
import { DiscordooProviders } from '@src/constants'
import { DefaultWebhookClientStack } from '@src/core/apps/webhook/DefaultWebhookClientStack'
import { WebhookClient } from '@src/core/apps/webhook/WebhookClient'

export class WebhookApplicationBuilder<Stack extends DefaultWebhookClientStack = DefaultWebhookClientStack> {
  public options: WebhookClientOptions

  private readonly customClient: any

  constructor(data: CreateWebhookData, options?: CreateAppOptions) {
    let { id, token } = data
    if (!id || !token) {
      if (!data.url) throw new ValidationError(
        'WebhookApplicationBuilder',
        'Invalid webhook data provided. You should specify either id and token or url. Specified:',
        data
      )
      const url = new URL(data.url)
      const path = url.pathname.split('/')
      id = path[3]
      token = path[4]
    }

    if (!is<string>(id)) throw new ValidationError('WebhookApplicationBuilder', 'Invalid id provided:', id)
    if (!is<string>(token)) throw new ValidationError('WebhookApplicationBuilder', 'Invalid token provided:', token)

    this.options = { id, token }
    if (!this.options.providers) this.options.providers = []

    if (options?.useApp) this.customClient = options.useApp
  }

  rest(options: WebhookClientOptions['rest']): WebhookApplicationBuilder {
    if (!is<WebhookClientOptions['rest']>(options)) this.throwInvalidOptionsError('rest', options)

    this.options.rest = options
    return this
  }

  restProvider(provider: ProviderConstructor<Stack['rest']>, ...options: any[]): WebhookApplicationBuilder<Stack> {
    return this.useProvider(DiscordooProviders.Rest, provider, ...options)
  }

  private useProvider(providerSignature: DiscordooProviders, provider: any, ...options: any[]): WebhookApplicationBuilder<Stack> {
    const providerIndex = this.options.providers!.findIndex(p => p.provide === provider)
    if (providerIndex > -1) this.options.providers!.splice(providerIndex, 1)

    this.options.providers!.push({
      provide: providerSignature,
      useClass: provider,
      useOptions: options
    })

    return this
  }

  private throwInvalidOptionsError(from: string, invalid: any) {
    throw new ValidationError(
      `${this.constructor.name}#${from} | createWebhookApp#${from}`,
      'invalid', from, 'options provided'
    )._setInvalidOptions(invalid)
  }

  build<T extends WebhookClient = WebhookClient<Stack>>(): T {
    if (this.customClient) return new this.customClient(this.options)

    return new WebhookClient<Stack>(this.options) as unknown as T
  }
}