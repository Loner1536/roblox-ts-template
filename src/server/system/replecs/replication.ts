import { Context, System } from "@shared/ecs";
import Network from "@shared/network";

@System({ phase: "Replication", name: "Replecs" })
export default class ReplecsReplication extends Context {
    public run() {
        const ready = Network.Replecs.Ready.onServer((_, player) => {
            if (this.Replicator.server.is_player_ready(player)) return;
            this.Replicator.server.mark_player_ready(player);
            const [payload] = this.Replicator.server.get_full(player);
            Network.Replecs.Full.fireClient(player, payload);
        });
        this.Cleanup = () => ready.disconnect();
        return () => {
            for (const [player, payload] of this.Replicator.server.collect_updates()) Network.Replecs.Reliable.fireClient(player, payload);
            for (const [player, payload] of this.Replicator.server.collect_unreliable()) Network.Replecs.Unreliable.fireClient(player, payload);
        };
    }
}
