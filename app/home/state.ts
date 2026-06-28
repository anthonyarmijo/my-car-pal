export type UpdateOdometerState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialUpdateOdometerState: UpdateOdometerState = {
  status: "idle",
  message: "",
};
