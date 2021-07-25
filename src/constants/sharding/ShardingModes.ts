/** Sharding manager modes */
export const enum ShardingModes {
  /** Spawn sharding instances in different processes */
  PROCESSES = 'processes',
  /** Spawn sharding instances in different worker threads */
  WORKERS = 'workers',
  /** Spawn sharding instances in different node.js's clusters */
  CLUSTERS = 'clusters',
  /** Connect to child sharding managers in different machines and pass sharding instructions to them */
  MACHINES = 'machines',
}