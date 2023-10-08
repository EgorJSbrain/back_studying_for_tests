import { Filter, Sort } from 'mongodb'
import { DBfields } from '../db/constants'
import { getCollection } from '../db/mongo-db'
import { SortDirections } from '../constants/global'

import { ResponseBody } from '../types/global'
import { ICreatingUser, IUser, UsersRequestParams } from '../types/users'

const db = getCollection<IUser>(DBfields.users)

export const UsersRepository = {
  async getUsers(params: UsersRequestParams): Promise<ResponseBody<IUser> | null> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10,
        searchLoginTerm,
        searchEmailTerm
      } = params

      const sort: Sort = {}
      let filter: Filter<IUser> = {}

      if (searchLoginTerm || searchEmailTerm) {
        filter = {
          $or: [
            { email: { $regex: searchLoginTerm, $options: 'i' } },
            { login: { $regex: searchEmailTerm, $options: 'i' } }
          ]
        }
      }

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
      }

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await db.countDocuments(filter)
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const users = await db
        .find(filter, { projection: { _id: 0, passwordHash: 0, passwordSalt: 0 } })
        .sort(sort)
        .skip(skip)
        .limit(pageSizeNumber)
        .toArray()

      const updatedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        login: user.login,
        createdAt: user.createdAt
      }))

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: updatedUsers
      }
    } catch {
      return null
    }
  },

  async getuserByLoginOrEmail(login: string, email: string) {
    try {
      const user = await db.findOne(
        { $or: [{ login }, { email }] },
        { projection: { _id: 0, passwordHash: 0, passwordSalt: 0 } }
      )

      return user
    } catch {
      return null
    }
  },

  async createUser(data: ICreatingUser) {
    try {
      let user

      const response = await db.insertOne(data)

      if (response.insertedId) {
        user = await db.findOne(
          { id: data.id },
          { projection: { _id: 0, passwordHash: 0, passwordSalt: 0 } }
        )
      }

      return user
    } catch {
      return null
    }
  },

  async deleteUser(id: string) {
    try {
      const response = await db.deleteOne({ id })

      return !!response.deletedCount
    } catch {
      return null
    }
  }
}