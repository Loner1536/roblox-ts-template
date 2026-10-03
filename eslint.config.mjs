import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import robloxTs from "eslint-plugin-roblox-ts";

export default [{
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: { parser: tsparser, parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    plugins: { "@typescript-eslint": tseslint, "roblox-ts": robloxTs },
    rules: { ...robloxTs.configs.recommended.rules, "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] },
}];
