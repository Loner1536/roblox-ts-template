import { Flamework } from "@flamework/core";
import "@shared/network";

Flamework.addPaths("src/client/controller");
Flamework.addPaths("src/client/system");
Flamework.ignite();
