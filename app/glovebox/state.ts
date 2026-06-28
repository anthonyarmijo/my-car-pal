export type GloveboxFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialGloveboxFormState: GloveboxFormState = {
  status: "idle",
  message: "",
};
