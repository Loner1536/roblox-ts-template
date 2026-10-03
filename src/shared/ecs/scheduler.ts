import { Phase, Scheduler } from "@rbxts/planck";
import { RunService } from "@rbxts/services";
import type { World } from "@rbxts/jecs";

export const Phases = { Input: new Phase("Input"), Update: new Phase("Update"), Replication: new Phase("Replication"), Visual: new Phase("Visual") } as const;
export type SystemPhase = keyof typeof Phases;

export default class ECSScheduler {
    public readonly Phases = Phases;
    public readonly Planck: Scheduler<[World]>;
    public constructor(world: World) { this.Planck = new Scheduler(world); }
    public Start(): void {
        this.Planck.insert(Phases.Input, RunService, "Heartbeat");
        this.Planck.insert(Phases.Update, RunService, "Heartbeat");
        this.Planck.insert(Phases.Replication, RunService, "Heartbeat");
        if (RunService.IsClient()) this.Planck.insert(Phases.Visual, RunService, "PreRender");
    }
}
