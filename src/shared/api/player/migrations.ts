import { MigrationStep } from "@rbxts/lyra";

interface LegacyProfile { coins: number; firstJoinedAt?: number }

export default [MigrationStep.transform<LegacyProfile, Types.Player.Profile>("add-first-joined-at", (profile) => ({
    coins: profile.coins,
    firstJoinedAt: profile.firstJoinedAt ?? 0,
}))];
