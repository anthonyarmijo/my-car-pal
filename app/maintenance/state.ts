export type MaintenanceFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialMaintenanceFormState: MaintenanceFormState = {
  status: "idle",
  message: "",
};

export type RecalculateAllState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialRecalculateAllState: RecalculateAllState = {
  status: "idle",
  message: "",
};
