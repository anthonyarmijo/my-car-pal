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
  PageHeader,
  Separator,
} from "../index";

const meta = {
  title: "Design System/Primitives",
  parameters: {
    docs: {
      description: {
        component: "Presentational My Car Pal primitives using the Desert Graphite token set.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonsAndBadges: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Button>Save vehicle</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Remind later</Button>
        <Button variant="success">Marked done</Button>
        <Button variant="danger">Delete log</Button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Badge>Garage</Badge>
        <Badge variant="accent">Due soon</Badge>
        <Badge variant="info">Imported schedule</Badge>
        <Badge variant="success">Current</Badge>
        <Badge variant="warning">Needs review</Badge>
        <Badge variant="danger">Expired</Badge>
      </div>
    </div>
  ),
};

export const CardsAndHeader: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "760px" }}>
      <PageHeader
        title="Maintenance"
        description="Track service history, upcoming work, and reminders without mixing UI with vehicle data fetching."
        actions={<Button>Add service log</Button>}
      />
      <Card as="article" variant="accent">
        <CardHeader>
          <CardTitle>2020 Toyota Tacoma</CardTitle>
          <CardDescription>Oil change, tire rotation, and registration reminders are all on schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Badge variant="success">No active alerts</Badge>
            <Badge variant="info">61,240 miles</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary">View vehicle</Button>
          <Button>Update odometer</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const FeedbackStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "760px" }}>
      <Alert title="Registration due soon" variant="warning" actions={<Button variant="secondary">Open glovebox</Button>}>
        Renew by July 15 and upload the new registration card when it arrives.
      </Alert>
      <Alert title="Insurance updated" variant="success">
        The policy card is attached to two vehicles and visible in the glovebox.
      </Alert>
      <Separator />
      <EmptyState
        title="No receipts yet"
        description="Add service receipts after maintenance visits so the ownership history stays complete."
        actions={<Button>Add receipt</Button>}
      />
    </div>
  ),
};
