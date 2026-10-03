import type { World } from "@rbxts/jecs";
import Jecs from "@rbxts/jecs";
import Lync from "@rbxts/lync";
import Replecs from "@rbxts/replecs";
import LyncUtility from "@rbxts/lync-utility";
import Network from "@shared/network";

export default class Components {
    public constructor(private readonly world: World) {}

    private component<T>(name: string, codec: Lync.Codec<T>) {
        const component = this.world.component<T>();
        this.world.add(component, Replecs.Shared);
        this.world.set(component, Jecs.Name, name);
        this.world.set(component, Replecs.Serdes, LyncUtility.serdes(codec, { variants: false }));
        return component;
    }

    public readonly Player = { UserId: this.component("Player.UserId", Network.Codecs.Player.UserId) };
}
