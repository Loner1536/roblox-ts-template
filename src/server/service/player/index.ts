import { OnInit, Service } from "@flamework/core";
import type { Entity } from "@rbxts/jecs";
import { Players } from "@rbxts/services";
import ECS from "@shared/ecs";
import Stores from "@shared/stores";
import StoreService from "../store";

@Service()
export default class PlayerService implements OnInit {
    private readonly entities = new Map<Player, Entity>();
    public constructor(private readonly store: StoreService) {}
    public onInit(): void {
        for (const player of Players.GetPlayers()) this.add(player);
        Players.PlayerAdded.Connect((player) => this.add(player));
        Players.PlayerRemoving.Connect((player) => this.remove(player));
    }
    public getProfile(player: Player): Types.Player.Profile { return this.store.get(player); }
    public updateProfile(player: Player, transform: (profile: Types.Player.Profile) => boolean): boolean { return this.store.update(player, transform); }
    public getEntity(player: Player): Entity | undefined { return this.entities.get(player); }
    private add(player: Player): void {
        const profile = this.store.load(player);
        if (profile.firstJoinedAt === 0) this.store.update(player, (data) => { data.firstJoinedAt = DateTime.now().UnixTimestamp; return true; });
        const entity = ECS.W.entity(); ECS.W.set(entity, ECS.C.Player.UserId, player.UserId);
        ECS.Replicator.server.set_networked(entity); ECS.Replicator.server.set_reliable(entity, ECS.C.Player.UserId);
        this.entities.set(player, entity);
    }
    private remove(player: Player): void {
        const entity = this.entities.get(player); if (entity !== undefined) ECS.W.delete(entity);
        this.entities.delete(player); this.store.unload(player); Stores.Player.remove(player.UserId);
    }
}
