import Lync from "@rbxts/lync";
export default {
    Player: {
        Profile: Lync.struct({ coins: Lync.f64(), firstJoinedAt: Lync.f64() }),
        UserId: Lync.vlq(),
    },
    Replecs: { Unreliable: Lync.buffer(0, 900), Reliable: Lync.buffer(0, 16_384) },
};
