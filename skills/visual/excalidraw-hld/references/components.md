# Components

Everything `compose.mjs` can place. Names are the `use` values; `node scripts/compose.mjs --list`
prints the same set from the sheet, which wins if the two ever disagree. "Label" is the
default text in the component's label slot — override it with `label` in the spec.

## Clients

| Name         | Label              | Stands for                                  |
| ------------ | ------------------ | ------------------------------------------- |
| `user`       | User               | A person. Use once, at the far left         |
| `mobile-app` | Mobile App         | iOS / Android client                        |
| `web-app`    | Web or Desktop App | Browser, SPA or desktop client              |

## Edge

| Name            | Label          | Stands for                                         |
| --------------- | -------------- | -------------------------------------------------- |
| `dns`           | DNS            | Name resolution; draw it when geo/latency routing matters |
| `cdn`           | CDN            | Static assets and cached responses near the user   |
| `load-balancer` | Load Balancers | L4/L7 balancer in front of a fleet                 |
| `api-gateway`   | API Gateway    | Auth, rate limits, routing to services             |

## Compute

| Name                   | Label                | Stands for                                       |
| ---------------------- | -------------------- | ------------------------------------------------ |
| `service`              | <> Service           | One microservice. Relabel: `"<>\nOrders"`         |
| `service-pool`         | Service Pool         | Several services behind one boundary             |
| `job`                  | Job 1                | One background / cron job                        |
| `jobs`                 | Jobs                 | A set of workers or scheduled jobs               |
| `server`               | Server               | A single host or a monolith                      |
| `server-node`          | Server 1             | One node of a fleet (small)                      |
| `servers`              | Server 1             | Two nodes — a horizontally scaled pair           |
| `autoscaling-servers`  | Autoscaling Servers  | Stateless fleet that scales out                  |
| `notification-service` | Notification Service | Push / email / SMS fan-out service               |

## External services

| Name   | Label | Stands for                         |
| ------ | ----- | ---------------------------------- |
| `fcm`  | FCM   | Firebase Cloud Messaging (Android) |
| `apns` | APNs  | Apple Push Notification service    |

Relabel either for any third party you call (`"Stripe"`, `"SES"`).

## Data

| Name                    | Label                 | Stands for                                   |
| ----------------------- | --------------------- | -------------------------------------------- |
| `database`              | Database              | Any OLTP store. Name the engine in the label |
| `autoscaling-databases` | Autoscaling Databases | Sharded / partitioned store                  |
| `cache`                 | Cache                 | Redis / Memcached, single node               |
| `cache-cluster`         | Caches                | Distributed cache                            |
| `object-storage`        | Object Storage        | S3 / GCS blobs, media, exports               |
| `elasticsearch`         | Elasticsearch         | Search index                                 |

## Messaging

| Name       | Label    | Stands for                                  |
| ---------- | -------- | ------------------------------------------- |
| `queue`    | Queue    | Point-to-point queue (SQS, BullMQ)          |
| `producer` | Producer | Writes to a queue                           |
| `consumer` | Consumer | Reads from a queue                          |
| `pub`      | PUB      | Publisher on a topic                        |
| `sub`      | SUB      | Subscriber on a topic                       |
| `topic`    | Topic    | Pub/sub topic (SNS, Redis pub/sub)          |
| `kafka`    | Kafka    | Log-based stream with partitions and replay |

## Analytics & observability

| Name         | Label        | Stands for                      |
| ------------ | ------------ | ------------------------------- |
| `spark`      | Apache Spark | Batch / stream processing       |
| `monitoring` | Monitoring   | Metrics, traces, logs, alerting |

## Patterns

Pre-drawn compositions with fixed labels — place them as-is (no `label`), or read them as
the reference for how to wire the atoms above. Also in the library for drawing live.

| Name                              | Shows                                             |
| --------------------------------- | ------------------------------------------------- |
| `pattern:clients`                 | Mobile + web clients in one card                  |
| `pattern:client-dns-flow`         | User → app → DNS → back                           |
| `pattern:master-slave`            | Primary with two replicas, writes fan out         |
| `pattern:read-replicas`           | Database with two read replicas                   |
| `pattern:producer-queue-consumer` | Producer → Queue → Consumer                       |
| `pattern:pub-topic-sub`           | PUB → Topic → SUB                                 |
| `pattern:notification-fanout`     | Notification Service → FCM, APNs                  |
| `pattern:service-tier`            | Pool, jobs, server, pair and autoscaling fleet    |
| `pattern:data-tier`               | Databases │ caches │ object storage, with dividers |

Tiers and arrows aren't components: `compose.mjs` draws them from the spec in the same
dotted-card and dashed-arrow style.
