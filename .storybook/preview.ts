import type { Preview } from "@storybook/react-vite";
import "../packages/ui/src/styles/index.css";

const preview: Preview = {
  parameters: {
    a11y: {
      test: "todo",
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
};

export default preview;
