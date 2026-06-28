export type UpdateVehicleProfileState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialUpdateVehicleProfileState: UpdateVehicleProfileState = {
  status: "idle",
  message: "",
};
