import { SortOrder } from 'mongoose'
import { SortDirections } from '../constants/global'
import { Post } from '../models'

import { IPost } from '../types/posts'
import { RequestParams, ResponseBody } from '../types/global'
import { UpdatePostDto } from '../dtos/posts/update-post.dto'

export const PostsRepository = {
  async getPosts(params: RequestParams): Promise<ResponseBody<IPost> | null> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      const sort: Record<string, SortOrder> = {}

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
      }

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await Post.estimatedDocumentCount()
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const posts = await Post
        .find({}, { projection: { _id: 0 } })
        .sort(sort)
        .skip(skip)
        .limit(pageSizeNumber)
        .lean()

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: posts
      }
    } catch {
      return null
    }
  },

  async getPostById(id: string) {
    try {
      const post = await Post.findOne({ id }, { projection: { _id: 0 } })

      return post
    } catch {
      return null
    }
  },

  async createPost(data: IPost) {
    try {
      let post

      const response = await Post.create(data)

      if (response._id) {
        post = await Post.findOne(
          { _id: response._id },
          { projection: { _id: 0 } }
        )
      }

      return post
    } catch {
      return null
    }
  },

  async updatePost(id: string, data: UpdatePostDto) {
    try {
      let post
      const response = await Post.updateOne({ id }, { $set: data })

      if (response.modifiedCount) {
        post = await Post.findOne({ id }, { projection: { _id: 0 } })
      }

      return post
    } catch {
      return null
    }
  },

  async deletePost(id: string) {
    try {
      const response = await Post.deleteOne({ id })

      return !!response.deletedCount
    } catch {
      return null
    }
  },

  async getPostsByBlogId(
    blogId: string,
    params: RequestParams
  ): Promise<ResponseBody<IPost> | null> {
    try {
      const {
        sortBy = 'createdAt',
        sortDirection = SortDirections.desc,
        pageNumber = 1,
        pageSize = 10
      } = params

      const pageSizeNumber = Number(pageSize)
      const pageNumberNum = Number(pageNumber)
      const skip = (pageNumberNum - 1) * pageSizeNumber
      const count = await Post.countDocuments({ blogId })
      const pagesCount = Math.ceil(count / pageSizeNumber)

      const sort: Record<string, SortOrder> = {}

      if (sortBy && sortDirection) {
        sort[sortBy] = sortDirection === SortDirections.asc ? 1 : -1
      }

      const posts = await Post
        .find({ blogId }, { projection: { _id: 0 } })
        .sort(sort)
        .skip(skip)
        .limit(pageSizeNumber)
        .lean()

      return {
        pagesCount,
        page: pageNumberNum,
        pageSize: pageSizeNumber,
        totalCount: count,
        items: posts
      }
    } catch {
      return null
    }
  },

  async createPostByBlogId(data: IPost): Promise<IPost | null> {
    try {
      let post = null

      const response = await Post.create(data)

      if (response._id) {
        post = await Post.findOne(
          { _id: response._id },
          { projection: { _id: 0 } }
        ).lean()
      }

      return post
    } catch {
      return null
    }
  }
}
