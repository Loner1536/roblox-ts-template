import { OnInit, Service } from "@flamework/core";
import { RunService } from "@rbxts/services";
import Lync from "@rbxts/lync";
import LyncUtility from "@rbxts/lync-utility";
import Network from "@shared/network";
import Stores from "@shared/stores";

@Service({ loadOrder: 1 }) export default class LyncService implements OnInit {
    public onInit(): void {
        Lync.start(); RunService.PostSimulation.Connect(() => Lync.flush()); game.BindToClose(() => Lync.close());
        LyncUtility.sync(Stores.Player.getter, Network.Player.Profile);
    }
}
