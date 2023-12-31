import { FilterQuery } from 'mongoose'

import { LikeStatus } from '../constants/likes'
import { Like } from '../models'
import { Like as LikeType, ILikesInfo, LikesRequestParams } from '../types/likes'

export class LikesRepository {
  async getLikesCountsBySourceId(sourceId: string): Promise<ILikesInfo | null> {
    try {
      const filter: FilterQuery<ILikesInfo> = { sourceId }

      const likesCount = await Like.countDocuments({
        ...filter,
        status: 'Like'
      })
      const dislikesCount = await Like.countDocuments({
        ...filter,
        status: 'Dislike'
      })

      return {
        sourceId,
        dislikesCount,
        likesCount
      }
    } catch {
      return null
    }
  }

  async getSegmentOfLikesByParams(
    sourceId: string,
    limit: number,
    authorId?: string
  ): Promise<LikeType[] | null> {
    try {
      let filter: FilterQuery<ILikesInfo> = {
        sourceId,
        status: LikeStatus.like
      }

      if (authorId) {
        filter = {
          $and: [{ sourceId }, { authorId }],
          status: LikeStatus.like
        }
      }

      const count = await Like.countDocuments(filter)
      const countForSkiping = count < limit ? 0 : count - limit

      const newLikes = await Like
        .find(filter, { _id: 0, __v: 0 })
        .sort({ createdAt: 1 })
        .skip(countForSkiping)

      const sortedNewsetLikes = newLikes.sort((a, b) => {
        if (Number(new Date(a.createdAt)) > Number(new Date(b.createdAt))) return -1
        return 1
      })

      return sortedNewsetLikes
    } catch {
      return null
    }
  }

  async getLikeBySourceIdAndAuthorId(
    params: LikesRequestParams
  ): Promise<LikeType | null> {
    try {
      const like = await Like.findOne(
        { sourceId: params.sourceId, authorId: params.authorId },
        { _id: 0 }
      ).lean()

      if (!like) {
        return null
      }

      return like
    } catch {
      return null
    }
  }

  async createLike(data: LikeType): Promise<boolean> {
    try {
      const response = await Like.create(data)

      return !!response._id
    } catch {
      return false
    }
  }

  async updateLike(id: string, newStatus: LikeStatus): Promise<boolean> {
    try {
      const response = await Like.updateOne({ id }, { status: newStatus })

      return !!response
    } catch {
      return false
    }
  }
}
