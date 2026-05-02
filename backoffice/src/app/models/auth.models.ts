export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_broadcast_staff?: boolean;
  type: string | null;
  type_enum: string | null;
}

export interface AuthPayload {
  access_token: string;
  token_type: string;
}

export interface LoginSuccessResponse {
  data: {
    user: AuthUser;
    auth: AuthPayload;
  };
  message?: string;
  status?: string;
}
