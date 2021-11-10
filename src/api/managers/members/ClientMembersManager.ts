import { EntitiesCacheManager, GuildMember, GuildResolvable, RoleResolvable, UserResolvable } from '@src/api'
import { Client } from '@src/core'
import { Keyspaces } from '@src/constants'
import { EntitiesManager } from '@src/api/managers/EntitiesManager'
import { GuildMemberEditData } from '@src/api/entities/member/interfaces/GuildMemberEditData'
import { RawGuildMemberEditData } from '@src/api/entities/member/interfaces/RawGuildMemberEditData'
import { resolveChannelId, resolveGuildId, resolveRoleId, resolveUserId, resolveUserOrMemberId } from '@src/utils/resolve'
import { DiscordooError, DiscordSnowflake } from '@src/utils'
import { filterAndMap } from '@src/utils/filterAndMap'
import { MemberEditOptions } from '@src/api/managers/members/MemberEditOptions'
import { MemberBanOptions } from '@src/api/managers/members/MemberBanOptions'
import { EntitiesUtil } from '@src/api/entities/EntitiesUtil'
import { GuildMemberResolvable } from '@src/api/entities/member/interfaces/GuildMemberResolvable'
import { GuildMembersFetchOptions } from '@src/api/managers/members/GuildMembersFetchOptions'
import { RawGuildMembersFetchOptions } from '@src/api/managers/members/RawGuildMembersFetchOptions'
import { GuildMemberAddData } from '@src/api/managers/members/GuildMemberAddData'
import { RawGuildMemberAddData } from '@src/api/managers/members/RawGuildMemberAddData'
import { ThreadChannelResolvable } from '@src/api/entities/channel/interfaces/ThreadChannelResolvable'

export class ClientMembersManager extends EntitiesManager {
  public cache: EntitiesCacheManager<GuildMember>

  constructor(client: Client) {
    super(client)

    this.cache = new EntitiesCacheManager<GuildMember>(this.client, {
      keyspace: Keyspaces.GUILD_MEMBERS,
      storage: 'global',
      entity: 'GuildMember',
      policy: 'members'
    })
  }

  async addGuildMember(
    guild: GuildResolvable, user: UserResolvable, data: GuildMemberAddData | RawGuildMemberAddData
  ): Promise<GuildMember | undefined> {
    const guildId = resolveGuildId(guild),
      userId = resolveUserOrMemberId(user)

    if (!guildId) throw new DiscordooError('ClientMembersManager#addGuildMember', 'Cannot add member without guild id.')
    if (!userId) throw new DiscordooError('ClientMembersManager#addGuildMember', 'Cannot add member without member id.')

    const payload: RawGuildMemberAddData = {
      access_token: 'accessToken' in data ? data.accessToken : data.access_token,
      mute: data.mute,
      deaf: data.deaf,
      nick: data.nick,
    }

    if (data.roles) {
      payload.roles = filterAndMap(
        data.roles,
        (r, filtered) => { const id = resolveRoleId(r); return id !== undefined && !filtered.includes(id) },
        (r) => resolveRoleId(r)
      )
    }

    const response = await this.client.internals.actions.addGuildMember(guildId, userId, payload)
    const Member = EntitiesUtil.get('GuildMember')

    if (response.success) {
      if (typeof response.result === 'object') return await new Member(this.client).init(response.result)
    }

    return undefined
  }

  async addThreadMember(thread: ThreadChannelResolvable, user: UserResolvable | GuildMemberResolvable): Promise<boolean> {
    const channelId = resolveGuildId(thread),
      userId = resolveUserOrMemberId(user)

    if (!channelId) throw new DiscordooError('ClientMembersManager#addThreadMember', 'Cannot add member without thread id.')
    if (!userId) throw new DiscordooError('ClientMembersManager#addThreadMember', 'Cannot add member without member id.')

    const response = await this.client.internals.actions.addThreadMember(channelId, userId)

    return response.success
  }

  async removeThreadMember(thread: ThreadChannelResolvable, user: UserResolvable | GuildMemberResolvable | '@me'): Promise<boolean> {
    const channelId = resolveGuildId(thread),
      userId = user === '@me' ? user : resolveUserOrMemberId(user)

    if (!channelId) throw new DiscordooError('ClientMembersManager#addThreadMember', 'Cannot add member without thread id.')
    if (!userId) throw new DiscordooError('ClientMembersManager#addThreadMember', 'Cannot add member without member id.')

    const response = await this.client.internals.actions.removeThreadMember(channelId, userId)

    return response.success
  }

  async fetchOne(guild: GuildResolvable, user: UserResolvable | GuildMemberResolvable): Promise<GuildMember | undefined> {
    const guildId = resolveGuildId(guild),
      userId = resolveUserOrMemberId(user)

    if (!guildId) throw new DiscordooError('ClientMembersManager#fetchOne', 'Cannot fetch member without guild id.')
    if (!userId) throw new DiscordooError('ClientMembersManager#fetchOne', 'Cannot fetch member without member id.')

    const response = await this.client.internals.actions.getGuildMember(guildId, userId)
    const Member = EntitiesUtil.get('GuildMember')

    if (response.success) {
      const member = await new Member(this.client).init({ ...response.result, guild_id: guildId })
      await this.cache.set(member.userId, member, { storage: guildId })
      return member
    }

    return undefined
  }

  async fetchMany(guild: GuildResolvable, options: GuildMembersFetchOptions = {}): Promise<GuildMember[] | undefined> {
    const guildId = resolveGuildId(guild)

    if (!guildId) throw new DiscordooError('ClientMembersManager#fetchMany', 'Cannot fetch members without guild id.')

    const b = BigInt
    const shardId = Number(b(guildId) >> b(22) % b(this.client.internals.sharding.totalShards))

    const users: string | string[] | undefined =
      options.users !== undefined && Array.isArray(options.users)
      ? filterAndMap(options.users, (u) => resolveUserId(u) !== undefined, (u) => resolveUserId(u))
      : options.users !== undefined
          ? resolveUserId(options.users)
          : undefined

    const payload: RawGuildMembersFetchOptions = {
      guild_id: guildId,
      limit: options.limit ?? 0,
      query: options.query ?? '',
      presences: !!options.presences,
      user_ids: users,
      nonce: options.nonce ?? DiscordSnowflake.generate()
    }

    return this.client.internals.actions.fetchWsGuildMembers(shardId, payload)
      // TODO: .catch(e => this.client.internals.errors.handle(e))
  }

  fetch(
    guild: GuildResolvable,
    userOrOptions: UserResolvable | GuildMemberResolvable | GuildMembersFetchOptions
  ): Promise<GuildMember | GuildMember[] | undefined> {
    const id = resolveUserOrMemberId(userOrOptions as any)

    return id
      ? this.fetchOne(guild, userOrOptions as UserResolvable | GuildMemberResolvable )
      : this.fetchMany(guild, userOrOptions as GuildMembersFetchOptions)
  }

  async edit<R = GuildMember>(
    guild: GuildResolvable,
    user: UserResolvable | GuildMemberResolvable | '@me',
    data: GuildMemberEditData | RawGuildMemberEditData,
    options: MemberEditOptions = {}
  ): Promise<R | undefined> {
    const userId = user === '@me' ? user : resolveUserOrMemberId(user),
      guildId = resolveGuildId(guild)

    if (!userId) throw new DiscordooError('ClientMembersManager#edit', 'Cannot edit member without id.')
    if (!guildId) throw new DiscordooError('ClientMembersManager#edit', 'Cannot edit member without guild id.')

    const payload: RawGuildMemberEditData = {}

    if ('mute' in data) {
      payload.mute = !!data.mute
    }

    if ('deaf' in data) {
      payload.deaf = !!data.deaf
    }

    if (data.roles) {
      payload.roles = filterAndMap(
        data.roles,
        (r, filtered) => { const id = resolveRoleId(r); return id !== undefined && !filtered.includes(id) },
        (r) => resolveRoleId(r)
      )
    }

    if ('channel' in data) {
      if (data.channel === null) {
        payload.channel_id = null
      } else {
        const id = resolveChannelId(data.channel)
        if (id) payload.channel_id = id
      }
    } else if ('channel_id' in data) {
      if (data.channel_id !== undefined) payload.channel_id = data.channel_id
    }

    if ('nick' in data) {
      payload.nick = data.nick
    }

    const response = await this.client.internals.actions.editGuildMember(
      guildId,
      userId,
      userId === '@me' ? { nick: payload.nick } : payload,
      options.reason
    )

    if (response.success) {
      const GuildMember = EntitiesUtil.get('GuildMember')

      if (options.patchEntity) {
        return await options.patchEntity.init(response.result) as any
      } else {
        return await new GuildMember(this.client).init({ ...response.result, guild_id: guildId }) as any
      }
    }

    return undefined
  }

  async ban(
    guild: GuildResolvable,
    user: UserResolvable | GuildMemberResolvable,
    options: MemberBanOptions = {}
  ): Promise<boolean> {
    const userId = resolveUserOrMemberId(user),
      guildId = resolveGuildId(guild)

    if (!userId) throw new DiscordooError('ClientMembersManager#ban', 'Cannot ban member without id.')
    if (!guildId) throw new DiscordooError('ClientMembersManager#ban', 'Cannot ban member without guild id.')

    const response = await this.client.internals.actions.banGuildMember(guildId, userId, options.deleteMessagesDays, options.reason)

    return response.success
  }

  async unban(
    guild: GuildResolvable,
    user: UserResolvable | GuildMemberResolvable,
    reason?: string
  ): Promise<boolean> {
    const userId = resolveUserOrMemberId(user),
      guildId = resolveGuildId(guild)

    if (!userId) throw new DiscordooError('ClientMembersManager#unban', 'Cannot unban member without id.')
    if (!guildId) throw new DiscordooError('ClientMembersManager#unban', 'Cannot unban member without guild id.')

    const response = await this.client.internals.actions.unbanGuildMember(guildId, userId, reason)

    return response.success
  }

  async kick(
    guild: GuildResolvable,
    user: UserResolvable | GuildMemberResolvable,
    reason?: string
  ): Promise<boolean> {
    const userId = resolveUserOrMemberId(user),
      guildId = resolveGuildId(guild)

    if (!userId) throw new DiscordooError('ClientMembersManager#ban', 'Cannot kick member without id.')
    if (!guildId) throw new DiscordooError('ClientMembersManager#ban', 'Cannot kick member without guild id.')

    const response = await this.client.internals.actions.kickGuildMember(guildId, userId, reason)

    return response.success
  }

  async addRole(
    guild: GuildResolvable,
    user: UserResolvable | GuildMemberResolvable,
    role: RoleResolvable,
    reason?: string
  ): Promise<boolean> {
    const userId = resolveUserOrMemberId(user),
      guildId = resolveGuildId(guild),
      roleId = resolveRoleId(role)

    if (!userId) throw new DiscordooError('ClientMembersManager#addRole', 'Cannot add role to member roles without member id.')
    if (!guildId) throw new DiscordooError('ClientMembersManager#addRole', 'Cannot add role to member roles without guild id.')
    if (!roleId) throw new DiscordooError('ClientMembersManager#addRole', 'Cannot add role to member roles without role id.')

    const response = await this.client.internals.actions.addGuildMemberRole(guildId, userId, roleId, reason)

    return response.success
  }

  async removeRole(
    guild: GuildResolvable,
    user: UserResolvable | GuildMemberResolvable,
    role: RoleResolvable,
    reason?: string
  ): Promise<boolean> {
    const userId = resolveUserOrMemberId(user),
      guildId = resolveGuildId(guild),
      roleId = resolveRoleId(role)

    if (!userId) {
      throw new DiscordooError('ClientMembersManager#removeRole', 'Cannot remove role from member roles without member id.')
    }
    if (!guildId) {
      throw new DiscordooError('ClientMembersManager#removeRole', 'Cannot remove role from member roles without guild id.')
    }
    if (!roleId) {
      throw new DiscordooError('ClientMembersManager#removeRole', 'Cannot remove role from member roles without role id.')
    }

    const response = await this.client.internals.actions.removeGuildMemberRole(guildId, userId, roleId, reason)

    return response.success
  }

}
