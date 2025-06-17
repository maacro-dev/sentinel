export type Role = "data_collector" | "data_manager" | "admin";
export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
};
