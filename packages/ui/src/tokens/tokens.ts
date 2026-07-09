export type TokenValue = {
  value: string;
  cssVariable: `--mcp-${string}`;
  description: string;
};

export type TokenGroup = Record<string, TokenValue>;

export type TokenManifest = {
  name: string;
  version: string;
  theme: "desert-graphite";
  description: string;
  color: {
    primitive: TokenGroup;
    semantic: TokenGroup;
    state: TokenGroup;
  };
  space: TokenGroup;
  radius: TokenGroup;
  shadow: TokenGroup;
  typography: {
    family: TokenGroup;
    size: TokenGroup;
    lineHeight: TokenGroup;
    weight: TokenGroup;
  };
  focus: TokenGroup;
};

export const desertGraphiteTokens = {
  name: "My Car Pal Desert Graphite",
  version: "0.1.0",
  theme: "desert-graphite",
  description:
    "Owner-first My Car Pal tokens for the Warm Scandinavian Garage direction: warm porcelain/cream surfaces, moss/forest green primary actions, sand/taupe structure, blue-gray secondary states, and sage success only.",
  color: {
    primitive: {
      "graphite.950": {
        value: "#211f1c",
        cssVariable: "--mcp-color-graphite-950",
        description: "Near-black graphite for navigation and deepest text on light surfaces.",
      },
      "graphite.900": {
        value: "#2b2925",
        cssVariable: "--mcp-color-graphite-900",
        description: "Graphite shell and dark elevated surface.",
      },
      "graphite.700": {
        value: "#4d4941",
        cssVariable: "--mcp-color-graphite-700",
        description: "Muted graphite for secondary dark text and icons.",
      },
      "porcelain.50": {
        value: "#fffdf8",
        cssVariable: "--mcp-color-porcelain-50",
        description: "Warm porcelain page background.",
      },
      "porcelain.100": {
        value: "#fbf7ef",
        cssVariable: "--mcp-color-porcelain-100",
        description: "Quiet porcelain fill for muted surfaces.",
      },
      "sand.100": {
        value: "#efe5d2",
        cssVariable: "--mcp-color-sand-100",
        description: "Light sand structure and soft fills.",
      },
      "sand.200": {
        value: "#dcc8a8",
        cssVariable: "--mcp-color-sand-200",
        description: "Primary sand border color.",
      },
      "taupe.500": {
        value: "#9c8a72",
        cssVariable: "--mcp-color-taupe-500",
        description: "Taupe secondary border and muted UI detail.",
      },
      "tobacco.600": {
        value: "#9a6538",
        cssVariable: "--mcp-color-tobacco-600",
        description: "Legacy tobacco/copper accent kept for compatibility; prefer moss.600 for actions.",
      },
      "tobacco.700": {
        value: "#7c4f2d",
        cssVariable: "--mcp-color-tobacco-700",
        description: "Legacy pressed tobacco state kept for compatibility; prefer forest.700 for actions.",
      },
      "moss.600": {
        value: "#38624C",
        cssVariable: "--mcp-color-moss-600",
        description: "Primary moss green action and accent.",
      },
      "forest.700": {
        value: "#274A38",
        cssVariable: "--mcp-color-forest-700",
        description: "Pressed or high-contrast deep forest action state.",
      },
      "bluegray.500": {
        value: "#697987",
        cssVariable: "--mcp-color-bluegray-500",
        description: "Muted blue-gray for secondary and informational states.",
      },
      "bluegray.700": {
        value: "#465763",
        cssVariable: "--mcp-color-bluegray-700",
        description: "High-contrast blue-gray text and ghost actions.",
      },
      "sage.600": {
        value: "#6f8666",
        cssVariable: "--mcp-color-sage-600",
        description: "Success-only sage action state.",
      },
      "sage.700": {
        value: "#596f53",
        cssVariable: "--mcp-color-sage-700",
        description: "Success-only sage text state.",
      },
      "red.600": {
        value: "#b8554e",
        cssVariable: "--mcp-color-red-600",
        description: "Error and destructive action color.",
      },
      "amber.600": {
        value: "#b8722d",
        cssVariable: "--mcp-color-amber-600",
        description: "Warning and review-needed color.",
      },
    },
    semantic: {
      text: {
        value: "#28231d",
        cssVariable: "--mcp-color-text",
        description: "Default foreground text.",
      },
      muted: {
        value: "#6f6252",
        cssVariable: "--mcp-color-muted",
        description: "Secondary text and quiet labels.",
      },
      border: {
        value: "{color.primitive.sand.200}",
        cssVariable: "--mcp-color-border",
        description: "Default component border.",
      },
      surface: {
        value: "#ffffff",
        cssVariable: "--mcp-color-surface",
        description: "Primary card and control surface.",
      },
      "surface.muted": {
        value: "{color.primitive.porcelain.100}",
        cssVariable: "--mcp-color-surface-muted",
        description: "Secondary card and quiet control surface.",
      },
      "action.primary": {
        value: "{color.primitive.moss.600}",
        cssVariable: "--mcp-color-action-primary",
        description: "Primary call-to-action background.",
      },
      "action.primary.strong": {
        value: "{color.primitive.forest.700}",
        cssVariable: "--mcp-color-action-primary-strong",
        description: "Primary action hover, pressed, and gradient stop.",
      },
      "action.secondary": {
        value: "{color.primitive.bluegray.700}",
        cssVariable: "--mcp-color-action-secondary",
        description: "Secondary and ghost action foreground.",
      },
    },
    state: {
      success: {
        value: "{color.primitive.sage.600}",
        cssVariable: "--mcp-color-state-success",
        description: "Positive success state. Do not use sage for neutral decoration.",
      },
      "success.strong": {
        value: "{color.primitive.sage.700}",
        cssVariable: "--mcp-color-state-success-strong",
        description: "High-contrast success text.",
      },
      warning: {
        value: "{color.primitive.amber.600}",
        cssVariable: "--mcp-color-state-warning",
        description: "Warning, due soon, or needs-review state.",
      },
      danger: {
        value: "{color.primitive.red.600}",
        cssVariable: "--mcp-color-state-danger",
        description: "Error, expired, or destructive state.",
      },
      info: {
        value: "{color.primitive.bluegray.500}",
        cssVariable: "--mcp-color-state-info",
        description: "Informational and secondary state.",
      },
    },
  },
  space: {
    "1": { value: "0.25rem", cssVariable: "--mcp-space-1", description: "4px spacing unit." },
    "2": { value: "0.5rem", cssVariable: "--mcp-space-2", description: "8px spacing unit." },
    "3": { value: "0.75rem", cssVariable: "--mcp-space-3", description: "12px spacing unit." },
    "4": { value: "1rem", cssVariable: "--mcp-space-4", description: "16px spacing unit." },
    "5": { value: "1.25rem", cssVariable: "--mcp-space-5", description: "20px spacing unit." },
    "6": { value: "1.5rem", cssVariable: "--mcp-space-6", description: "24px spacing unit." },
  },
  radius: {
    xs: { value: "4px", cssVariable: "--mcp-radius-xs", description: "Small details and badges." },
    sm: { value: "6px", cssVariable: "--mcp-radius-sm", description: "Inputs and buttons." },
    md: { value: "8px", cssVariable: "--mcp-radius-md", description: "Cards and alerts." },
  },
  shadow: {
    sm: {
      value: "0 4px 14px rgba(33, 31, 28, 0.06)",
      cssVariable: "--mcp-shadow-sm",
      description: "Default low elevation.",
    },
    md: {
      value: "0 16px 34px rgba(33, 31, 28, 0.1)",
      cssVariable: "--mcp-shadow-md",
      description: "Prominent elevation for accent panels.",
    },
  },
  typography: {
    family: {
      sans: {
        value: 'var(--font-sans, var(--font-geist-sans), "Geist", "Avenir Next", "Segoe UI", sans-serif)',
        cssVariable: "--mcp-font-sans",
        description: "Primary product UI type stack.",
      },
    },
    size: {
      xs: { value: "0.78rem", cssVariable: "--mcp-font-size-xs", description: "Badges and compact metadata." },
      sm: { value: "0.86rem", cssVariable: "--mcp-font-size-sm", description: "Field labels and small controls." },
      md: { value: "0.94rem", cssVariable: "--mcp-font-size-md", description: "Default body and input text." },
      lg: { value: "1.05rem", cssVariable: "--mcp-font-size-lg", description: "Card titles." },
      xl: { value: "1.45rem", cssVariable: "--mcp-font-size-xl", description: "Page title minimum size." },
    },
    lineHeight: {
      tight: { value: "1.18", cssVariable: "--mcp-line-height-tight", description: "Compact headings." },
      normal: { value: "1.4", cssVariable: "--mcp-line-height-normal", description: "Controls and short copy." },
      relaxed: { value: "1.5", cssVariable: "--mcp-line-height-relaxed", description: "Longer explanatory copy." },
    },
    weight: {
      regular: { value: "400", cssVariable: "--mcp-font-weight-regular", description: "Body text." },
      semibold: { value: "700", cssVariable: "--mcp-font-weight-semibold", description: "Important UI copy." },
      bold: { value: "800", cssVariable: "--mcp-font-weight-bold", description: "Labels, badges, and button text." },
    },
  },
  focus: {
    color: {
      value: "rgba(105, 121, 135, 0.24)",
      cssVariable: "--mcp-focus-ring-color",
      description: "Accessible blue-gray focus halo.",
    },
    ring: {
      value: "0 0 0 3px rgba(105, 121, 135, 0.24)",
      cssVariable: "--mcp-focus-ring",
      description: "Default focus-visible box shadow.",
    },
  },
} as const satisfies TokenManifest;

export type DesertGraphiteTokenManifest = typeof desertGraphiteTokens;

export const desertGraphiteCssVariables = {
  "--mcp-font-sans": desertGraphiteTokens.typography.family.sans.value,
  "--mcp-color-graphite-950": desertGraphiteTokens.color.primitive["graphite.950"].value,
  "--mcp-color-graphite-900": desertGraphiteTokens.color.primitive["graphite.900"].value,
  "--mcp-color-graphite-700": desertGraphiteTokens.color.primitive["graphite.700"].value,
  "--mcp-color-porcelain-50": desertGraphiteTokens.color.primitive["porcelain.50"].value,
  "--mcp-color-porcelain-100": desertGraphiteTokens.color.primitive["porcelain.100"].value,
  "--mcp-color-sand-100": desertGraphiteTokens.color.primitive["sand.100"].value,
  "--mcp-color-sand-200": desertGraphiteTokens.color.primitive["sand.200"].value,
  "--mcp-color-taupe-500": desertGraphiteTokens.color.primitive["taupe.500"].value,
  "--mcp-color-tobacco-600": desertGraphiteTokens.color.primitive["tobacco.600"].value,
  "--mcp-color-tobacco-700": desertGraphiteTokens.color.primitive["tobacco.700"].value,
  "--mcp-color-moss-600": desertGraphiteTokens.color.primitive["moss.600"].value,
  "--mcp-color-forest-700": desertGraphiteTokens.color.primitive["forest.700"].value,
  "--mcp-color-bluegray-500": desertGraphiteTokens.color.primitive["bluegray.500"].value,
  "--mcp-color-bluegray-700": desertGraphiteTokens.color.primitive["bluegray.700"].value,
  "--mcp-color-sage-600": desertGraphiteTokens.color.primitive["sage.600"].value,
  "--mcp-color-sage-700": desertGraphiteTokens.color.primitive["sage.700"].value,
  "--mcp-color-red-600": desertGraphiteTokens.color.primitive["red.600"].value,
  "--mcp-color-amber-600": desertGraphiteTokens.color.primitive["amber.600"].value,
  "--mcp-color-text": desertGraphiteTokens.color.semantic.text.value,
  "--mcp-color-muted": desertGraphiteTokens.color.semantic.muted.value,
  "--mcp-color-border": "var(--mcp-color-sand-200)",
  "--mcp-color-surface": desertGraphiteTokens.color.semantic.surface.value,
  "--mcp-color-surface-muted": "var(--mcp-color-porcelain-100)",
  "--mcp-color-action-primary": "var(--mcp-color-moss-600)",
  "--mcp-color-action-primary-strong": "var(--mcp-color-forest-700)",
  "--mcp-color-action-secondary": "var(--mcp-color-bluegray-700)",
  "--mcp-color-state-success": "var(--mcp-color-sage-600)",
  "--mcp-color-state-success-strong": "var(--mcp-color-sage-700)",
  "--mcp-color-state-warning": "var(--mcp-color-amber-600)",
  "--mcp-color-state-danger": "var(--mcp-color-red-600)",
  "--mcp-color-state-info": "var(--mcp-color-bluegray-500)",
  "--mcp-shadow-sm": desertGraphiteTokens.shadow.sm.value,
  "--mcp-shadow-md": desertGraphiteTokens.shadow.md.value,
  "--mcp-radius-xs": desertGraphiteTokens.radius.xs.value,
  "--mcp-radius-sm": desertGraphiteTokens.radius.sm.value,
  "--mcp-radius-md": desertGraphiteTokens.radius.md.value,
  "--mcp-space-1": desertGraphiteTokens.space["1"].value,
  "--mcp-space-2": desertGraphiteTokens.space["2"].value,
  "--mcp-space-3": desertGraphiteTokens.space["3"].value,
  "--mcp-space-4": desertGraphiteTokens.space["4"].value,
  "--mcp-space-5": desertGraphiteTokens.space["5"].value,
  "--mcp-space-6": desertGraphiteTokens.space["6"].value,
  "--mcp-font-size-xs": desertGraphiteTokens.typography.size.xs.value,
  "--mcp-font-size-sm": desertGraphiteTokens.typography.size.sm.value,
  "--mcp-font-size-md": desertGraphiteTokens.typography.size.md.value,
  "--mcp-font-size-lg": desertGraphiteTokens.typography.size.lg.value,
  "--mcp-font-size-xl": desertGraphiteTokens.typography.size.xl.value,
  "--mcp-line-height-tight": desertGraphiteTokens.typography.lineHeight.tight.value,
  "--mcp-line-height-normal": desertGraphiteTokens.typography.lineHeight.normal.value,
  "--mcp-line-height-relaxed": desertGraphiteTokens.typography.lineHeight.relaxed.value,
  "--mcp-font-weight-regular": desertGraphiteTokens.typography.weight.regular.value,
  "--mcp-font-weight-semibold": desertGraphiteTokens.typography.weight.semibold.value,
  "--mcp-font-weight-bold": desertGraphiteTokens.typography.weight.bold.value,
  "--mcp-focus-ring-color": desertGraphiteTokens.focus.color.value,
  "--mcp-focus-ring": desertGraphiteTokens.focus.ring.value,
} as const;
