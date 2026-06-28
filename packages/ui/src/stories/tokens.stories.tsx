import type { Meta, StoryObj } from "@storybook/react-vite";
import { desertGraphiteTokens } from "../index";

const colorSwatches = [
  desertGraphiteTokens.color.primitive["graphite.950"],
  desertGraphiteTokens.color.primitive["porcelain.50"],
  desertGraphiteTokens.color.primitive["sand.200"],
  desertGraphiteTokens.color.primitive["tobacco.600"],
  desertGraphiteTokens.color.primitive["bluegray.500"],
  desertGraphiteTokens.color.primitive["sage.600"],
];

const semanticTokens = [
  desertGraphiteTokens.color.semantic["action.primary"],
  desertGraphiteTokens.color.semantic["action.secondary"],
  desertGraphiteTokens.color.state.success,
  desertGraphiteTokens.color.state.warning,
  desertGraphiteTokens.color.state.danger,
  desertGraphiteTokens.focus.ring,
];

const meta = {
  title: "Design System/Tokens",
  parameters: {
    docs: {
      description: {
        component: "The first reusable token set for the Desert Graphite visual system.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesertGraphitePalette: Story = {
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
