export interface User {
  id: string;
  name?: {
    firstName: string;
    lastName: string;
  }
  avatar?: string;
  email?: string;
  [key: string]: unknown;
}
