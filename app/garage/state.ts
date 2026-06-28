export type AddVehicleFormState = {
  status: "idle" | "error" | "success";
  message: string;
  nextAction: {
    href: string;
    label: string;
    description: string;
  } | null;
};

export const initialAddVehicleFormState: AddVehicleFormState = {
  status: "idle",
  message: "",
  nextAction: null,
};
