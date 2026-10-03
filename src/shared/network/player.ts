import Lync from "@rbxts/lync";
import Codecs from "./codecs";
export default Lync.define("Player", { Profile: Lync.replicate(Codecs.Player.Profile) });
