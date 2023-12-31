import { ValidationChain, FieldValidationError } from 'express-validator'
import {
  confirmationCodeValidation,
  blogDescriptionValidation,
  blogNameValidation,
  checkExistedUserByLoginValidation,
  checkExistedUserByEmailValidation,
  commentContentValidation,
  pageNumberValidation,
  pageSizeNumberValidation,
  postBlogIdValidation,
  postContentValidation,
  postDescriptionValidation,
  postTitleValidation,
  sortDirectionValidation,
  userEmailValidation,
  userLoginFormatValidation,
  userLoginOrEmailValidation,
  userLoginValidation,
  userPasswordValidation,
  videoAgeRestrictionValidation,
  videoAuthorValidation,
  videoAvailableResolutionsValidation,
  videoCanBeDownloadedValidation,
  videoPublicationDateValidation,
  videoTitleValidation,
  websiteUrlLengthValidation,
  websiteUrlValidation,
  checkExistedUserByCodeValidation,
  checkExistedVerificationCodeValidation,
  checkUnexistedUserByEmailValidation,
  checkExistedConfirmedUserByEmailValidation,
  checkRecoveryCodeValidation,
  likeValidation
} from './validationRules'
import { Error } from '../../types/global'
import { UserInputFields } from '../../constants/users'

export const transformErrors = (errors: FieldValidationError[]): Error[] => errors.map(error => ({
  field: error.path,
  message: error.msg
}))

export const BlogsCreateUpdateValidation = (): ValidationChain[] => [
  blogNameValidation,
  blogDescriptionValidation,
  websiteUrlLengthValidation,
  websiteUrlValidation
]

export const PostsCreateUpdateValidation = (): ValidationChain[] => [
  postTitleValidation,
  postDescriptionValidation,
  postContentValidation,
  postBlogIdValidation
]

export const VideoCreateValidation = (): ValidationChain[] => [
  videoTitleValidation,
  videoAuthorValidation,
  videoAvailableResolutionsValidation
]

export const VideoUpdateValidation = (): ValidationChain[] => [
  videoTitleValidation,
  videoAuthorValidation,
  videoAgeRestrictionValidation,
  videoAvailableResolutionsValidation,
  videoCanBeDownloadedValidation,
  videoPublicationDateValidation
]

export const PostCreateByBlogIdValidation = (): ValidationChain[] => [
  postTitleValidation,
  postDescriptionValidation,
  postContentValidation
]

export const UserCreateValidation = (): ValidationChain[] => [
  userLoginValidation,
  userLoginFormatValidation,
  userPasswordValidation(UserInputFields.password),
  userEmailValidation,
  checkExistedUserByLoginValidation,
  checkExistedUserByEmailValidation
]

export const RegistrationConfirmValidation = (): ValidationChain[] => [
  confirmationCodeValidation,
  checkExistedUserByCodeValidation,
  checkExistedVerificationCodeValidation
]

export const UserLoginValidation = (): ValidationChain[] => [
  userLoginOrEmailValidation,
  userPasswordValidation(UserInputFields.password)
]

export const UserEmailValidation = (): ValidationChain[] => [
  userEmailValidation,
  checkUnexistedUserByEmailValidation,
  checkExistedConfirmedUserByEmailValidation
]

export const CommentsValidation = (): ValidationChain[] => [
  commentContentValidation
]

export const LikeValidation = (): ValidationChain[] => [
  likeValidation
]

export const requestParamsValidation = (): ValidationChain[] => [
  pageNumberValidation,
  pageSizeNumberValidation,
  sortDirectionValidation
]

export const EmailValidation = (): ValidationChain[] => [
  userEmailValidation
]
export const RecoveryPasswordValidation = (): ValidationChain[] => [
  userPasswordValidation(UserInputFields.newPassword),
  checkRecoveryCodeValidation
]
