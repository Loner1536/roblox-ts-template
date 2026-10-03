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

## Player data example

`PlayerService` loads a Lyra profile when a player joins, records `firstJoinedAt` once, creates an ECS entity, and assigns the replicated `Player.UserId` component. When the player leaves, it deletes the entity and unloads the profile.

Add a field in four places:

1. Add its TypeScript type in `src/types/player.d.ts`.
2. Add its default value in `src/shared/api/player/template.ts`.
3. Add validation in `src/shared/api/player/schema.ts`.
4. Add a named migration in `src/shared/api/player/migrations.ts` for existing players.

Use `PlayerService.updateProfile(player, profile => { ...; return true; })` on the server. Returning `true` accepts and replicates the update.

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

Do not put session, match, movement, or other game-specific components into the template itself.

## Konsole

Konsole is hosted on the server and enabled on the client. In Studio, every player receives administrator access; in production, only the experience creator does by default.

No example commands are registered because commands should represent the game using the template. Add command definitions to the server Konsole service or split them into a dedicated command module.

## Debugging

Jabby runs only in Studio. Press `F4` on the client to open its ECS debugger.

## Checks

```sh
bun run lint
bun run compile
bun run build
```
