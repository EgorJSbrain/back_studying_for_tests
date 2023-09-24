import { Router, Request, Response } from 'express'

import { VideosService } from '../services/videos'
import { HTTP_STATUSES } from '../constants/global'
import { VideoInputFields } from '../constants/videos'
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody
} from '../types/global'
import { IVideo } from '../types/videos'
import { CreateVideoDto } from '../dtos/videos/create-video.dto'
import { UpdateVideoDto } from '../dtos/videos/update-video.dto'
import { FieldValidationError, Result, ValidationError, validationResult } from 'express-validator'
import { VideoCreateValidation, VideoUpdateValidation, transformErrors } from '../utils/validation/inputValidations'

export const videosRouter = Router({})

videosRouter.get('/', async (_: Request, res: Response<IVideo[]>) => {
  const videos = await VideosService.getVideos()

  if (!videos) {
    return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
  }

  res.status(HTTP_STATUSES.OK_200).send(videos)
})

videosRouter.get(
  '/:id',
  async (req: RequestWithParams<{ id: string }>, res: Response<IVideo>) => {
    const { id } = req.params

    if (!id) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    const video = await VideosService.getVideoById(Number(id))

    if (!video) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    res.status(HTTP_STATUSES.OK_200).send(video)
  }
)

videosRouter.post(
  '/',
  VideoCreateValidation(),
  async (req: RequestWithBody<CreateVideoDto>, res: Response) => {
    const { title, author, minAgeRestriction, canBeDownloaded, availableResolutions } = req.body

    const resultValidation: Result<ValidationError> = validationResult(req)

    if (!resultValidation.isEmpty()) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
        errorsMessages: transformErrors(resultValidation.array({ onlyFirstError: true }) as FieldValidationError[])
      })
    }

    const creatingData = {
      [VideoInputFields.title]: title,
      [VideoInputFields.author]: author,
      [VideoInputFields.minAgeRestriction]: minAgeRestriction,
      [VideoInputFields.canBeDownloaded]: canBeDownloaded,
      [VideoInputFields.availableResolutions]: availableResolutions
    }

    const video = await VideosService.createVideo(creatingData)

    if (!video) {
      return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    }

    res.status(HTTP_STATUSES.CREATED_201).send(video)
  }
)

videosRouter.put(
  '/:id',
  VideoUpdateValidation(),
  async (
    req: RequestWithParamsAndBody<{ id: string }, UpdateVideoDto>,
    res: Response
  ) => {
    const { id } = req.params
    const {
      title,
      author,
      minAgeRestriction,
      canBeDownloaded,
      availableResolutions,
      publicationDate
    } = req.body

    if (!id) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    const existedVideo = await VideosService.getVideoById(Number(id))

    if (!existedVideo) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    const resultValidation: Result<ValidationError> = validationResult(req)

    if (!resultValidation.isEmpty()) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
        errorsMessages: transformErrors(resultValidation.array({ onlyFirstError: true }) as FieldValidationError[])
      })
    }

    const updatedVideo = {
      [VideoInputFields.title]: req.body[VideoInputFields.title]
        ? title
        : existedVideo?.title,
      [VideoInputFields.author]: req.body[VideoInputFields.author]
        ? author
        : existedVideo?.author,
      [VideoInputFields.minAgeRestriction]: req.body[
        VideoInputFields.minAgeRestriction
      ]
        ? minAgeRestriction
        : existedVideo?.minAgeRestriction || null,
      [VideoInputFields.canBeDownloaded]: req.body[
        VideoInputFields.canBeDownloaded
      ]
        ? canBeDownloaded
        : existedVideo?.canBeDownloaded,
      [VideoInputFields.availableResolutions]: req.body[
        VideoInputFields.availableResolutions
      ]
        ? availableResolutions
        : existedVideo?.availableResolutions,
      [VideoInputFields.publicationDate]: req.body[VideoInputFields.publicationDate]
        ? publicationDate
        : existedVideo?.publicationDate
    }

    const video = await VideosService.updateVideo(Number(id), updatedVideo)

    if (!video) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    res.status(HTTP_STATUSES.NO_CONTENT_204).send(video)
  }
)

videosRouter.delete(
  '/:id',
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const { id } = req.params

    if (!id) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    const response = await VideosService.deleteVideo(Number(id))

    if (!response) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }
)
