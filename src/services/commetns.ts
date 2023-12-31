import { CommentsRepository } from '../repositories'
import { RequestParams, ResponseBody } from '../types/global'
import { CreateCommentDto } from '../dtos/comments/create-comment.dto'
import { IUser } from '../types/users'
import { UpdateCommentDto } from '../dtos/comments/update-comment.dto'
import { Comment, IComment } from '../types/comments'
import { LikesService } from './likes'
import { LikeStatus } from '../constants/likes'
import { Like } from '../types/likes'

export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected likesService: LikesService
  ) {}

  async getCommentsByPostId(
    params: RequestParams,
    postId: string,
    userId: string | null
  ): Promise<ResponseBody<Comment> | null> {
    const comments = await this.commentsRepository.getCommentsByPostId(
      params,
      postId
    )

    if (!comments) {
      return null
    }

    const commentsWithInfoAboutLikes = await Promise.all(comments.items.map(async (comment) => {
      const likesCounts = await this.likesService.getLikesCountsBySourceId(comment.id)

      let likesUserInfo

      if (userId) {
        likesUserInfo = await this.likesService.getLikeBySourceIdAndAuthorId(comment.id, userId)
      }

      return {
        ...comment,
        likesInfo: {
          likesCount: likesCounts?.likesCount,
          dislikesCount: likesCounts?.dislikesCount,
          myStatus: likesUserInfo ? likesUserInfo.status : LikeStatus.none
        }
      }
    }))

    return {
      ...comments,
      items: commentsWithInfoAboutLikes
    }
  }

  async getCommentById(id: string, userId?: string | null): Promise<IComment | null> {
    let myLike: Like | null = null

    const comment = await this.commentsRepository.getCommentById(id)

    if (!comment) {
      return null
    }

    const likesCounts = await this.likesService.getLikesCountsBySourceId(comment.id)

    if (userId) {
      myLike = await this.likesService.getLikeBySourceIdAndAuthorId(comment.id, userId)
    }

    return {
      ...comment,
      likesInfo: {
        likesCount: likesCounts?.likesCount ?? 0,
        dislikesCount: likesCounts?.dislikesCount ?? 0,
        myStatus: myLike?.status ?? LikeStatus.none
      }
    }
  }

  async createComment(
    data: CreateCommentDto,
    user: IUser,
    postId: string
  ): Promise<Comment | null> {
    const createdComment = new Comment(
      data.content,
      user.accountData.id,
      user.accountData.login,
      postId
    )

    return await this.commentsRepository.createComment(createdComment)
  }

  async updateComment(
    id: string,
    data: UpdateCommentDto
  ): Promise<IComment | null> {
    return await this.commentsRepository.updateComment(id, data)
  }

  async deleteComment(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(id)
  }
}
