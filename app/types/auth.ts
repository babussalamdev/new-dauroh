export interface AuthUser {
  email: string
  email_verified: boolean | string
  phone_number?: string
  preferred_username?: string
  name: string
  role: string
}
