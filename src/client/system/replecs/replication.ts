import LyncUtility from "@rbxts/lync-utility";
import { Context, System } from "@shared/ecs";
import Network from "@shared/network";

@System({ phase: "Replication", name: "Replecs" })
export default class ReplecsReplication extends Context {
    public run() {
        const unreliable = LyncUtility.collect(Network.Replecs.Unreliable);
        const reliable = LyncUtility.collect(Network.Replecs.Reliable);
        const full = LyncUtility.collect(Network.Replecs.Full);
        this.Cleanup = () => { unreliable.disconnect(); reliable.disconnect(); full.disconnect(); };
        return () => {
            for (const payload of full.iter()) this.Replicator.client.apply_full(payload);
            for (const payload of reliable.iter()) this.Replicator.client.apply_updates(payload);
            for (const payload of unreliable.iter()) this.Replicator.client.apply_unreliable(payload);
        };
    }
}
