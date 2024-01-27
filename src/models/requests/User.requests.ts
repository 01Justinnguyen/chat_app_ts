export interface RegisterRequestBody {
  email: string
  name: string
  password: string
  date_of_birth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}
