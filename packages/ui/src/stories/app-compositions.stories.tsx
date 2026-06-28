import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  FormMessage,
  Input,
  PageHeader,
  Separator,
} from "../index";

const meta = {
  title: "Design System/App Compositions",
  parameters: {
    docs: {
      description: {
        component: "Static, app-realistic compositions for reviewing migrated My Car Pal surfaces without app imports.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthenticatedPageHeaderActionCluster: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "860px" }}>
      <PageHeader
        title="Garage"
        description="Manage vehicles, photos, mileage, and setup tasks from one owner-first workspace."
        actions={
          <>
            <Button variant="secondary">View checklist</Button>
            <Button>Add vehicle</Button>
          </>
        }
      />
      <Alert variant="info" title="Setup in progress">
        Two quick steps remain before reminders become personalized.
      </Alert>
    </div>
  ),
};

export const GarageEmptyFirstRunState: Story = {
  render: () => (
    <Card as="section" style={{ maxWidth: "720px" }}>
      <CardHeader>
        <CardTitle>Your Vehicles</CardTitle>
        <CardDescription>0 vehicles in your Garage.</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="Start with one vehicle"
          description="Add the vehicle you use most often first. Once that profile exists, the rest of setup gets easier."
          actions={
            <>
              <Button>Add your first vehicle</Button>
              <Button variant="secondary">View setup checklist</Button>
            </>
          }
        />
      </CardContent>
    </Card>
  ),
};

export const MaintenanceReminderServiceFeedbackState: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "760px" }}>
      <Card as="section">
        <CardHeader>
          <CardTitle>Add Service reminders</CardTitle>
          <CardDescription>Import recommended intervals or add a manual reminder.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="Vehicle" htmlFor="composition-maintenance-vehicle">
            <Input id="composition-maintenance-vehicle" value="2022 Toyota RAV4" readOnly />
          </Field>
          <FormMessage tone="success" style={{ marginTop: "0.85rem" }}>
            Schedule imported. Upcoming maintenance is now ready to review.
          </FormMessage>
        </CardContent>
        <CardFooter>
          <Button variant="secondary">Add manual reminder</Button>
          <Button>Log completed service</Button>
        </CardFooter>
      </Card>
      <Alert variant="warning" title="Oil change due soon">
        Due in 18 days or 420 miles, whichever comes first.
      </Alert>
    </div>
  ),
};

export const GloveboxDocumentInsuranceStatusState: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "820px" }}>
      <Card as="section">
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
          <CardDescription>Quick snapshot for insurance and registration renewal timing.</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <Card as="article" variant="muted">
            <CardContent>
              <Badge variant="success">Current</Badge>
              <h3 style={{ margin: "0.65rem 0 0", fontSize: "1rem" }}>Current Insurance</h3>
              <p style={{ color: "var(--mcp-color-muted)", margin: "0.4rem 0 0", lineHeight: 1.5 }}>
                Policy POL-2026 expires September 12, 2026.
              </p>
            </CardContent>
          </Card>
          <Card as="article" variant="muted">
            <CardContent>
              <Badge variant="warning">Due soon</Badge>
              <h3 style={{ margin: "0.65rem 0 0", fontSize: "1rem" }}>Registration Renewal</h3>
              <p style={{ color: "var(--mcp-color-muted)", margin: "0.4rem 0 0", lineHeight: 1.5 }}>
                Renew by July 15 and upload the new card.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Alert variant="success" title="Document uploaded">
        Registration card saved to the glovebox and attached to the selected vehicle.
      </Alert>
    </div>
  ),
};

export const AlertCalloutVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.85rem", maxWidth: "760px" }}>
      <Alert variant="info" title="Imported schedule available">
        Review manufacturer-style intervals before enabling reminders.
      </Alert>
      <Alert variant="success" title="Insurance current">
        Policy details are saved and no renewal action is needed today.
      </Alert>
      <Alert variant="warning" title="Registration due soon" actions={<Button variant="secondary">Open glovebox</Button>}>
        Renewal is coming up. Upload the new registration after it is issued.
      </Alert>
      <Alert variant="error" title="Upload failed">
        The file could not be saved. Try a PDF, JPEG, PNG, or WebP.
      </Alert>
      <Separator />
      <FormMessage tone="warning">Form-level warnings stay separate from route-level alerts.</FormMessage>
    </div>
  ),
};
