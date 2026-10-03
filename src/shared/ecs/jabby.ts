import { ContextActionService, RunService } from "@rbxts/services";
import type { Scheduler } from "@rbxts/planck";
import JabbyPlugin from "@rbxts/planck-jabby";
import type { World } from "@rbxts/jecs";
import Jabby from "@rbxts/jabby";

export function startJabby(world: World, scheduler: Scheduler<[World]>): void {
    if (!RunService.IsStudio()) return;
    scheduler.addPlugin(new JabbyPlugin());
    if (RunService.IsServer()) Jabby.set_check_function(() => RunService.IsStudio());
    Jabby.register({ applet: Jabby.applets.world, name: RunService.IsServer() ? "Template Server" : "Template Client", configuration: { world } });
    if (RunService.IsClient()) ContextActionService.BindAction("OpenJabby", (_name, state) => {
        if (state !== Enum.UserInputState.Begin) return Enum.ContextActionResult.Pass;
        const client = Jabby.obtain_client();
        client.spawn_app(client.apps.home);
        return Enum.ContextActionResult.Sink;
    }, false, Enum.KeyCode.F4);
}
