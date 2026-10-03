import { OnInit, Service } from "@flamework/core";
import { RunService } from "@rbxts/services";
import Konsole from "@rbxts/konsole";

@Service() export default class KonsoleService implements OnInit {
    public onInit(): void {
        Konsole.bindRanks((entity) => {
            if (typeIs(entity, "Instance") && entity.IsA("Player") && (RunService.IsStudio() || entity.UserId === game.CreatorId)) return 100;
        });
        Konsole.host();
    }
}
