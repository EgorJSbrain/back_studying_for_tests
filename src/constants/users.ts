export const LOGIN_MIN_LENGTH = 3
export const LOGIN_MAX_LENGTH = 10
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 20

export enum UserInputFields {
  login = 'login',
  password = 'password',
  email = 'email',
  loginOrEmail = 'loginOrEmail',
}

export const usersErrorMessage = {
  loginOrEmailRequired: 'loginOrEmail is required',
  loginLength: `Length of login shouldn't be less than ${LOGIN_MIN_LENGTH} and more than ${LOGIN_MAX_LENGTH} symbols`,
  loginFormat: 'Login is not valid',
  // eslint-disable-next-line max-len
  passwordLength: `Length of password shouldn't be less than ${PASSWORD_MIN_LENGTH} and more than ${PASSWORD_MAX_LENGTH} symbols`,
  emailFormat: 'Email is not valid'
}
