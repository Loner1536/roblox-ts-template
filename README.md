# roblox-ts-template

A batteries-included Roblox TypeScript starter with Flamework, Jecs/Planck, Replecs, Lync, Lyra player data, Vide, Konsole, Rotor, and Rojo.

This repository intentionally contains no game systems. The only ECS component provided is `Player.UserId`; build your game's components and systems from there.

## Setup

1. Install [Bun](https://bun.sh/) and [Rokit](https://github.com/rojo-rbx/rokit).
2. Run `rokit install`.
3. Run `bun install`.
4. Set your Roblox user or group ID in `rotor.toml` before syncing image assets.
5. Run `bun run dev` for the development workflow, or `bun run compile` and `bun run build` for a place file.

## Project layout

- `src/client/controller`: long-lived client Flamework controllers.
- `src/client/system`: client ECS systems.
- `src/server/service`: long-lived server Flamework services.
- `src/server/system`: server ECS systems.
- `src/shared/ecs`: world, components, scheduler, decorators, and Replecs setup.
- `src/shared/network`: Lync packet and replication definitions.
- `src/shared/api/player`: player profile template, validation schema, and migrations.
- `src/shared/stores`: reactive state replicated to clients.

## Player data

`PlayerService` loads an empty Lyra profile when a player joins, creates an ECS entity, and assigns the replicated `Player.UserId` component. When the player leaves, it deletes the entity and unloads the profile.

The profile type, template, schema, codec, and migration list are deliberately empty. They provide the wiring without making assumptions about your game's data.

### Adding the first profile fields

Profile data has five matching definitions. For example, to add coins:

```ts
// src/types/player.d.ts
declare namespace Types {
    namespace Player {
        interface Profile {
            coins: number;
        }
    }
}
```

```ts
// src/shared/api/player/template.ts
const Template = { coins: 0 } satisfies Types.Player.Profile;
export default Template;
```

```ts
// src/shared/api/player/schema.ts
import { t } from "@rbxts/t";
export default t.strictInterface({ coins: t.number });
```

```ts
// src/shared/network/codecs.ts
Profile: Lync.struct({ coins: Lync.f64() }),
```

Keep the migration list empty when no older saved profile shape exists. In general, adding a field means updating:

1. Add its TypeScript type in `src/types/player.d.ts`.
2. Add its default value in `src/shared/api/player/template.ts`.
3. Add validation in `src/shared/api/player/schema.ts`.
4. Add its Lync codec in `src/shared/network/codecs.ts`.
5. Add a migration if published players can have the older shape.

### Migration steps

Migrations convert previously saved data into the current `Types.Player.Profile`. Give every step a unique, permanent name and keep steps in the order they were introduced.

Suppose the published profile originally contained only `coins`, and the next version adds `gems`:

```ts
// Current profile type, template, schema, and codec now contain both fields.
interface Profile {
    coins: number;
    gems: number;
}
```

Describe the old shape locally and transform it into the new one:

```ts
// src/shared/api/player/migrations.ts
import { MigrationStep } from "@rbxts/lyra";

interface CoinsProfile {
    coins: number;
}

const Migrations = [
    MigrationStep.transform<CoinsProfile, Types.Player.Profile>("add-gems", (profile) => ({
        coins: profile.coins,
        gems: 0,
    })),
];

export default Migrations;
```

For another later change, append a second step instead of editing or renaming `add-gems`. Its input type should match the output of the preceding step:

```ts
interface GemsProfile {
    coins: number;
    gems: number;
}

const Migrations = [
    MigrationStep.transform<CoinsProfile, GemsProfile>("add-gems", (profile) => ({
        ...profile,
        gems: 0,
    })),
    MigrationStep.transform<GemsProfile, Types.Player.Profile>("add-level", (profile) => ({
        ...profile,
        level: 1,
    })),
];
```

Never remove, reorder, or reuse migration names after the game has saved production data. Update the current type, template, schema, and codec at the same time as the migration.

### Reading and updating profiles

Use `PlayerService.updateProfile(player, profile => { ...; return true; })` on the server. Returning `true` accepts and replicates the update.

```ts
this.Players.updateProfile(player, (profile) => {
    profile.coins += 10;
    return true;
});
```

Keep profile writes on the server. Clients receive the replicated profile through `Stores.Player`:

```ts
const localProfile = Stores.Player.get(Players.LocalPlayer.UserId);
```

Studio uses Lyra's mock DataStore services, so test data does not persist. Published servers use Roblox DataStore services.

## ECS systems

Create a class extending `Context`, decorate it with `@System`, and return the function Planck should run:

```ts
import { Context, System } from "@shared/ecs";

@System({ phase: "Update", name: "Example" })
export default class ExampleSystem extends Context {
    public run() {
        const players = this.W.query(this.C.Player.UserId).cached();
        this.Cleanup = () => players.fini();

        return () => {
            for (const [_entity, userId] of players) print(userId);
        };
    }
}
```

Files under the configured `controller`, `service`, and `system` paths are discovered by Flamework automatically.

## Replecs

The client and server replication systems are already registered. To add a replicated component, define it in `components.ts` with a Lync codec, then mark it networked/reliable/unreliable from authoritative server code.

For example, a replicated level component needs a codec and component:

```ts
// src/shared/network/codecs.ts
Level: Lync.int(1, 1_000),
```

```ts
// src/shared/ecs/components.ts
public readonly Player = {
    UserId: this.component("Player.UserId", Network.Codecs.Player.UserId),
    Level: this.component("Player.Level", Network.Codecs.Player.Level),
};
```

Set and register it from authoritative server code:

```ts
ECS.W.set(entity, ECS.C.Player.Level, 1);
ECS.Replicator.server.set_reliable(entity, ECS.C.Player.Level);
```

Use reliable replication for persistent state and unreliable replication for frequently changing state where an occasional dropped update is acceptable.

Do not put session, match, movement, or other game-specific components into the template itself.

## Konsole

Konsole is hosted on the server and enabled on the client. In Studio, every player receives administrator access; in production, only the experience creator does by default.

No commands are registered because commands should represent the game using the template. A server command can be defined after Konsole's rank configuration and before `Konsole.host()`:

```ts
const ping = Konsole.define({
    name: "ping",
    rank: "admin",
    description: "Checks whether the server command channel is available.",
    server: "ping",
    args: [],
});

Konsole.implement(ping.server, (context) => context.reply("Pong!"));
```

Keep privileged mutations on the server and assign an appropriate command rank. Split larger command sets into dedicated modules instead of growing the service indefinitely.

## Controllers and services

Use a controller for client-only lifecycle code and a service for server-only lifecycle code. Flamework constructs decorated classes and injects their constructor dependencies:

```ts
@Service()
export default class RewardService {
    public constructor(private readonly Players: PlayerService) {}

    public reward(player: Player, amount: number): void {
        this.Players.updateProfile(player, (profile) => {
            profile.coins += amount;
            return true;
        });
    }
}
```

The example assumes `coins` has already been added to the profile definitions above.

## Debugging

Jabby runs only in Studio. Press `F4` on the client to open its ECS debugger.

## Checks

```sh
bun run lint
bun run compile
bun run build
```
