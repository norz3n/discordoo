const b = BigInt
const one = b(1)

export const PermissionFlags = {
  CREATE_INSTANT_INVITE:      one << b(0),
  KICK_MEMBERS:               one << b(1), // one << one throws IDE error
  BAN_MEMBERS:                one << b(2),
  ADMINISTRATOR:              one << b(3),
  MANAGE_CHANNELS:            one << b(4),
  MANAGE_GUILD:               one << b(5),
  ADD_REACTIONS:              one << b(6),
  VIEW_AUDIT_LOG:             one << b(7),
  PRIORITY_SPEAKER:           one << b(8),
  STREAM:                     one << b(9),
  VIEW_CHANNEL:               one << b(10),
  SEND_MESSAGES:              one << b(11),
  SEND_TTS_MESSAGES:          one << b(12),
  MANAGE_MESSAGES:            one << b(13),
  EMBED_LINKS:                one << b(14),
  ATTACH_FILES:               one << b(15),
  READ_MESSAGE_HISTORY:       one << b(16),
  MENTION_EVERYONE:           one << b(17),
  USE_EXTERNAL_EMOJIS:        one << b(18),
  VIEW_GUILD_INSIGHTS:        one << b(19),
  CONNECT:                    one << b(20),
  SPEAK:                      one << b(21),
  MUTE_MEMBERS:               one << b(22),
  DEAFEN_MEMBERS:             one << b(23),
  MOVE_MEMBERS:               one << b(24),
  USE_VAD:                    one << b(25),
  CHANGE_NICKNAME:            one << b(26),
  MANAGE_NICKNAMES:           one << b(27),
  MANAGE_ROLES:               one << b(28),
  MANAGE_WEBHOOKS:            one << b(29),
  MANAGE_EMOJIS_AND_STICKERS: one << b(30),
  USE_APPLICATION_COMMANDS:   one << b(31),
  REQUEST_TO_SPEAK:           one << b(32),
  MANAGE_THREADS:             one << b(34),
  CREATE_PUBLIC_THREADS:      one << b(35),
  CREATE_PRIVATE_THREADS:     one << b(36),
  USE_EXTERNAL_STICKERS:      one << b(37),
  SEND_MESSAGES_IN_THREADS:   one << b(38),
  START_EMBEDDED_ACTIVITIES:  one << b(39),
  MODERATE_MEMBERS:           one << b(40),
}