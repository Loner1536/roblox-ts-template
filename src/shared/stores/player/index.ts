import { signal } from "@rbxts/charm";

const [getter, setter] = signal<Record<string, Types.Player.Profile>>({});
const get = (userId: string | number) => getter()[tostring(userId)];
const set = (userId: string | number, profile: Types.Player.Profile) => setter((state) => ({ ...state, [tostring(userId)]: profile }));
const remove = (userId: string | number) => setter((state) => { const updated = { ...state }; delete updated[tostring(userId)]; return updated; });

export default { getter, setter, get, set, remove };
