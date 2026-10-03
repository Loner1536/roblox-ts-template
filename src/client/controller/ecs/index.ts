import { Controller, OnInit } from "@flamework/core";
import ECS from "@shared/ecs";
@Controller({ loadOrder: -100 }) export default class ECSController implements OnInit { public onInit(): void { ECS.Start(); } }
