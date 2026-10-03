import { Flamework } from "@flamework/core";
import "@shared/network";

Flamework.addPaths("src/server/service");
Flamework.addPaths("src/server/system");
Flamework.ignite();
