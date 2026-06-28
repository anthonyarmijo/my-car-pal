export type ActivationStepId = "vehicle" | "mileage" | "reminder" | "service" | "documents";

export type ActivationAction = {
  href: string;
  label: string;
  description: string;
};

export type ActivationStep = {
  id: ActivationStepId;
  title: string;
  description: string;
  complete: boolean;
  action: ActivationAction;
};

export type ActivationState = {
  hasVehicle: boolean;
  hasMileage: boolean;
  hasReminderSetup: boolean;
  hasServiceLog: boolean;
  hasRegistrationOrInsuranceInfo: boolean;
  steps: ActivationStep[];
  nextStep: ActivationStep | null;
  completedCount: number;
  totalCount: number;
  progressLabel: string;
  isComplete: boolean;
};
