import { Controller, OnInit } from "@flamework/core";
import Konsole from "@rbxts/konsole";

@Controller() export default class KonsoleController implements OnInit {
    public onInit(): void { Konsole.setActivationUnlocksMouse(true); Konsole.setEnabled(true); }
}
