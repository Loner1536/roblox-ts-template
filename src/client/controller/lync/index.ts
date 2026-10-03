import { Controller, OnInit } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import Lync from "@rbxts/lync";
import LyncUtility from "@rbxts/lync-utility";
import API from "@shared/api";
import Network from "@shared/network";
import Stores from "@shared/stores";

@Controller({ loadOrder: 1 }) export default class LyncController implements OnInit {
    public onInit(): void {
        Stores.Player.set(Players.LocalPlayer.UserId, API.Player.Template);
        Lync.start(); Network.Replecs.Ready.fireServer(undefined); RunService.PostSimulation.Connect(() => Lync.flush());
        LyncUtility.hydrate(Network.Player.Profile, Stores.Player.setter);
    }
}
