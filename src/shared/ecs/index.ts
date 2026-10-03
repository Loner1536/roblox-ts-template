import { Modding } from "@flamework/core";
import type { Condition, SystemFn, SystemTable } from "@rbxts/planck";
import type { World } from "@rbxts/jecs";
import Jecs from "@rbxts/jecs";
import Replecs from "@rbxts/replecs";
import { RunService } from "@rbxts/services";
import Components from "./components";
import { System } from "./decorators";
import Scheduler from "./scheduler";
import { startJabby } from "./jabby";

export { System };
export abstract class Context {
    public readonly W = ECS.W; public readonly C = ECS.C; public readonly Replicator = ECS.Replicator; public readonly Scheduler = ECS.Scheduler;
    public readonly Conditions: Condition<[World]>[] = [];
    public Cleanup?: () => void;
    public abstract run(): SystemFn<[World]>;
}

class Runtime {
    public readonly W = Jecs.world();
    public readonly C = new Components(this.W);
    public readonly Replicator = Replecs.create();
    public readonly Scheduler = new Scheduler(this.W);
    public Start(): void {
        if (RunService.IsServer()) this.Replicator.server.init(this.W); else this.Replicator.client.init(this.W);
        this.Scheduler.Start(); startJabby(this.W, this.Scheduler.Planck);
        for (const descriptor of Modding.getDecorators<typeof System>()) {
            const constructor = descriptor.constructor; assert(constructor !== undefined);
            const context = Modding.resolveSingleton(constructor); assert(context instanceof Context);
            const [options = {}] = descriptor.arguments;
            const system: SystemTable<[World]> = { name: options.name ?? "System", category: options.category, runConditions: context.Conditions, system: context.run() };
            this.Scheduler.Planck.addSystem(system, options.phase !== undefined ? this.Scheduler.Phases[options.phase] : undefined);
        }
    }
}
const ECS = new Runtime();
export default ECS;
