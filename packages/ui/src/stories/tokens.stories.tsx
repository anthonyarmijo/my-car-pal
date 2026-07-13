import type { Meta, StoryObj } from "@storybook/react-vite";
import { myCarPalTokens } from "../index";

const colorSwatches = [
  myCarPalTokens.color.primitive["graphite.950"],
  myCarPalTokens.color.primitive["porcelain.50"],
  myCarPalTokens.color.primitive["sand.200"],
  myCarPalTokens.color.primitive["tobacco.600"],
  myCarPalTokens.color.primitive["bluegray.500"],
  myCarPalTokens.color.primitive["sage.600"],
];

const semanticTokens = [
  myCarPalTokens.color.semantic["action.primary"],
  myCarPalTokens.color.semantic["action.secondary"],
  myCarPalTokens.color.state.success,
  myCarPalTokens.color.state.warning,
  myCarPalTokens.color.state.danger,
  myCarPalTokens.focus.ring,
];

const meta = {
  title: "Design System/Tokens",
  parameters: {
    docs: {
      description: {
        component: "Reusable semantic tokens for the My Car Pal interface.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MyCarPalPalette: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
        {colorSwatches.map((token) => (
          <div
            key={token.cssVariable}
            style={{ border: "1px solid var(--mcp-color-border)", borderRadius: "8px", overflow: "hidden" }}
          >
            <div style={{ background: `var(${token.cssVariable})`, height: "5rem" }} />
            <div style={{ padding: "0.7rem", background: "var(--mcp-color-surface)" }}>
              <strong style={{ display: "block", color: "var(--mcp-color-text)" }}>
                {token.cssVariable.replace("--mcp-color-", "")}
              </strong>
              <span style={{ color: "var(--mcp-color-muted)", fontSize: "0.84rem" }}>{token.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: "0.5rem", maxWidth: "720px" }}>
        {semanticTokens.map((token) => (
          <div
            key={token.cssVariable}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(12rem, 0.8fr) minmax(0, 1fr)",
              gap: "0.75rem",
              alignItems: "center",
              padding: "0.7rem",
              border: "1px solid var(--mcp-color-border)",
              borderRadius: "8px",
              background: "var(--mcp-color-surface)",
            }}
          >
            <code style={{ color: "var(--mcp-color-text)", fontSize: "0.84rem" }}>{token.cssVariable}</code>
            <span style={{ color: "var(--mcp-color-muted)", fontSize: "0.84rem" }}>{token.description}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
