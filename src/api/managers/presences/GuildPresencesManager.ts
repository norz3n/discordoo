import { EntitiesCacheManager, Presence } from '@src/api'
import { DiscordApplication } from '@src/core'
import { Keyspaces } from '@src/constants'
import { EntitiesManager } from '@src/api/managers/EntitiesManager'
import { GuildPresencesManagerData } from '@src/api/managers/presences/GuildPresencesManagerData'
import { DiscordooError, resolveGuildId } from '@src/utils'

export class GuildPresencesManager extends EntitiesManager {
  public cache: EntitiesCacheManager<Presence>
  public guildId: string

  constructor(app: DiscordApplication, data: GuildPresencesManagerData) {
    super(app)

    const guildId = resolveGuildId(data.guild)
    if (!guildId) throw new DiscordooError('GuildPresencesManager', 'Cannot operate without guild id.')
    this.guildId = guildId

    this.cache = new EntitiesCacheManager<Presence>(this.app, {
      keyspace: Keyspaces.GuildPresences,
      storage: this.guildId,
      entity: 'Presence',
      policy: 'presences'
    })
  }
}
