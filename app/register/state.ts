export type SignupFormState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: {
    email?: string;
    password?: string;
  };
};

export const initialSignupFormState: SignupFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
