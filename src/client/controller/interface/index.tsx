import { Controller, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";
import Vide from "@rbxts/vide";

@Controller() export default class InterfaceController implements OnInit {
    public onInit(): void {
        const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
        Vide.mount(() => <screengui Name="Interface" ResetOnSpawn={false} IgnoreGuiInset />, playerGui);
    }
}
