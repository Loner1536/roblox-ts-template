import { OnInit, Service } from "@flamework/core";
import { createPlayerStore, MockDataStoreService, MockMemoryStoreService } from "@rbxts/lyra";
import { RunService } from "@rbxts/services";
import API from "@shared/api";
import Stores from "@shared/stores";

const studio = RunService.IsStudio();
@Service()
export default class StoreService implements OnInit {
    private readonly store = createPlayerStore<Types.Player.Profile>({
        name: "PlayerData", template: API.Player.Template, schema: API.Player.Schema, migrationSteps: API.Player.Migrations,
        dataStoreService: studio ? new MockDataStoreService() : undefined,
        memoryStoreService: studio ? new MockMemoryStoreService() : undefined,
        changedCallbacks: [(key, profile) => Stores.Player.set(key, profile)],
    });
    public onInit(): void { game.BindToClose(() => this.store.closeAsync()); }
    public load(player: Player): Types.Player.Profile { this.store.loadAsync(player); return this.store.getAsync(player); }
    public unload(player: Player): void { this.store.unloadAsync(player); }
    public get(player: Player): Types.Player.Profile { return this.store.getAsync(player); }
    public update(player: Player, transform: (profile: Types.Player.Profile) => boolean): boolean { return this.store.updateAsync(player, transform); }
}
