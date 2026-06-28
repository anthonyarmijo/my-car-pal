import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Button, Card, CardContent, Field, FormMessage, Input, Select, Textarea } from "../index";

const meta = {
  title: "Design System/Forms",
  parameters: {
    docs: {
      description: {
        component: "Data-agnostic form primitives for app-owned forms, server actions, and validation state.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const VehicleDetails: Story = {
  render: () => (
    <form style={{ display: "grid", gap: "1rem", maxWidth: "560px" }}>
      <Field label="VIN" htmlFor="vin" description="Use the 17-character VIN when it is available.">
        <Input id="vin" name="vin" placeholder="1HGCM82633A123456" />
      </Field>
      <Field label="Vehicle type" htmlFor="kind" required>
        <Select id="kind" name="kind" defaultValue="car">
          <option value="car">Car or truck</option>
          <option value="motorcycle">Motorcycle or scooter</option>
        </Select>
      </Field>
      <Field label="Service notes" htmlFor="notes">
        <Textarea id="notes" name="notes" placeholder="Add anything useful from the shop or owner manual..." />
      </Field>
      <FormMessage tone="success">VIN decoded. Review the trim before saving.</FormMessage>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Save vehicle</Button>
      </div>
    </form>
  ),
};

export const Validation: Story = {
  render: () => (
    <form style={{ display: "grid", gap: "1rem", maxWidth: "520px" }}>
      <Field label="Mileage" htmlFor="mileage" required error="Enter the current odometer reading.">
        <Input id="mileage" name="mileage" inputMode="numeric" placeholder="61240" aria-invalid="true" />
      </Field>
      <FormMessage tone="warning">Mileage changes update future reminder estimates.</FormMessage>
      <FormMessage as="div" tone="success">
        <p style={{ margin: 0 }}>Vehicle added. Continue setup when you are ready.</p>
        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", marginTop: "0.55rem" }}>
          <Button variant="secondary">View checklist</Button>
          <Button>Open garage</Button>
        </div>
      </FormMessage>
      <Button type="submit">Update odometer</Button>
    </form>
  ),
};

export const AuthEntryComposition: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
        maxWidth: "880px",
      }}
    >
      <Card as="section">
        <CardContent>
          <Badge>My Car Pal</Badge>
          <h2 style={{ color: "var(--mcp-color-text)", fontSize: "1.65rem", margin: "0.75rem 0 0" }}>
            Vehicle care, in your control.
          </h2>
          <p style={{ color: "var(--mcp-color-muted)", lineHeight: 1.6, margin: "0.75rem 0 0" }}>
            Track maintenance, organize documents, and keep upcoming tasks in one calm workspace.
          </p>
        </CardContent>
      </Card>

      <Card as="section">
        <CardContent>
          <Badge>Welcome Back</Badge>
          <h2 style={{ color: "var(--mcp-color-text)", fontSize: "1.65rem", margin: "0.75rem 0 0" }}>Login</h2>
          <p style={{ color: "var(--mcp-color-muted)", lineHeight: 1.6, margin: "0.6rem 0 0" }}>
            Static composition for reviewing migrated auth form primitives.
          </p>
          <form style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            <Field label="Email" htmlFor="storybook-login-email" required>
              <Input
                id="storybook-login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password" htmlFor="storybook-login-password" required>
              <Input
                id="storybook-login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <FormMessage tone="error">Use the app route to test live authentication behavior.</FormMessage>
            <Button type="submit">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  ),
};
