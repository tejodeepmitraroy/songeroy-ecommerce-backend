export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  aud?: string;
  iss?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}
