import { OnInit, Service } from "@flamework/core";
import ECS from "@shared/ecs";
@Service({ loadOrder: -100 }) export default class ECSService implements OnInit { public onInit(): void { ECS.Start(); } }
