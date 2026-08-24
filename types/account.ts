/** Values `AccountForm` submits to `updateAccount`. */
export type AccountInput = {
  name: string;
  email: string;
};

/** Values `PasswordForm` submits to `changePassword`. */
export type PasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
