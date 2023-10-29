import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import add from 'date-fns/add'

import { generateNewUser } from './utils'
import { UsersRepository } from '../repositories'

import { RequestParams } from '../types/global'
import { CreateUserDto } from '../dtos/users/create-user.dto'
import { IUser } from '../types/users'

export const UsersService = {
  async getUsers(params: RequestParams) {
    return await UsersRepository.getUsers(params)
  },

  async getUserById(id: string) {
    return await UsersRepository.getUserById(id)
  },

  async getUserByLoginOrEmail(email: string, login: string) {
    return await UsersRepository.getUserByLoginOrEmail(email, login)
  },

  async getUserByEmail(email: string) {
    return await UsersRepository.getUserByEmail(email)
  },

  async getUserByRecoveryCode(code: string) {
    return await UsersRepository.getUserByData({ 'userSecurity.recoveryPasswordCode': code })
  },

  async getUserByVerificationCode(code: string) {
    return await UsersRepository.getUserByVerificationCode(code)
  },

  async generateNewCode(data: IUser) {
    await this.updateUser(data.accountData.id, {
      'emailConfirmation.expirationDate': add(new Date(), {
        hours: 1,
        minutes: 10
      }),
      'emailConfirmation.confirmationCode': v4()
    })
  },

  async generateNewRecoveryPasswordCode(data: IUser) {
    await this.updateUser(data.accountData.id, { 'userSecurity.recoveryPasswordCode': v4() })
  },

  async confirmUserEmail(data: IUser) {
    return await this.updateUser(data.accountData.id, { 'emailConfirmation.isConfirmed': true })
  },

  async updateUser(id: string, data: any) {
    return await UsersRepository.updateUser(id, data)
  },

  async checkCredentials(loginOrEmail: string, password: string) {
    const existedUser = await UsersRepository.getUserByLoginOrEmail(loginOrEmail, loginOrEmail)

    if (existedUser && existedUser.passwordHash) {
      const passwordChecked = await bcrypt.compare(password, existedUser.passwordHash)

      if (passwordChecked) {
        return existedUser
      } else {
        return null
      }
    }

    return null
  },

  async createUser(data: CreateUserDto, isConfirmed?: boolean) {
    const { passwordSalt, passwordHash } = await this._generateHash(data.password)
    const createdUser = generateNewUser(data, passwordSalt, passwordHash, isConfirmed)

    return await UsersRepository.createUser(createdUser)
  },

  async updatePasswordUser(userId: string, newPassword: string) {
    console.log("-----!---userId:", userId)
    const { passwordSalt, passwordHash } = await this._generateHash(newPassword)

    return await this.updateUser(userId, { passwordSalt, passwordHash })
  },

  async deleteUser(id: string) {
    return await UsersRepository.deleteUser(id)
  },

  async _generateHash(password: string) {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, passwordSalt)

    return {
      passwordSalt,
      passwordHash
    }
  }
}
