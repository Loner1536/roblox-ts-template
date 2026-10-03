import Lync from "@rbxts/lync";
export default {
    Player: {
        Profile: Lync.struct({}),
        UserId: Lync.vlq(),
    },
    Replecs: { Unreliable: Lync.buffer(0, 900), Reliable: Lync.buffer(0, 16_384) },
};
