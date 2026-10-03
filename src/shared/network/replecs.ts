import Lync from "@rbxts/lync";
import Codecs from "./codecs";

export default Lync.define("Replecs", {
    Unreliable: Lync.packet(Codecs.Replecs.Unreliable).unreliable(),
    Reliable: Lync.packet(Codecs.Replecs.Reliable),
    Full: Lync.packet(Codecs.Replecs.Reliable),
    Ready: Lync.packet(Lync.empty()),
});
