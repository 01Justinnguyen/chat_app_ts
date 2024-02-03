import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { CLIENT_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import database from '~/services/database.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validator'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'

export const loginMiddleware = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: CLIENT_MESSAGE.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await database.users.findOne({ email: value, password: hashPassword(req.body.password) })
            if (user === null) {
              throw new Error(CLIENT_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: CLIENT_MESSAGE.PASSWORD_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: CLIENT_MESSAGE.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: CLIENT_MESSAGE.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerMiddleware = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: CLIENT_MESSAGE.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value) => {
            const result = await userService.checkEmailExists(value)
            if (result) throw new Error(CLIENT_MESSAGE.EMAIL_ALREADY_EXISTS)
            return true
          }
        }
      },
      name: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: CLIENT_MESSAGE.NAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 2,
            max: 100
          },
          errorMessage: CLIENT_MESSAGE.NAME_LENGTH_MUST_BE_FROM_2_TO_100
        }
      },
      password: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: CLIENT_MESSAGE.PASSWORD_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: CLIENT_MESSAGE.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: CLIENT_MESSAGE.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: CLIENT_MESSAGE.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: CLIENT_MESSAGE.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: CLIENT_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(CLIENT_MESSAGE.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
      },

      date_of_birth: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.DATE_OF_BIRTH_IS_REQUIRED
        },
        isISO8601: {
          errorMessage: CLIENT_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: CLIENT_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const access_token = value.split(' ')[1]
              if (access_token === undefined) {
                // Nếu không có access_token thì throw lỗi required
                throw new ErrorWithStatus({
                  message: CLIENT_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.SECRET_JWT_ACCESS_TOKEN_KEY as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  message: CLIENT_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.SECRET_JWT_REFRESH_TOKEN_KEY as string
                }),
                database.refreshToken.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: CLIENT_MESSAGE.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  message: CLIENT_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.SECRET_JWT_EMAIL_VERIFY_TOKEN_KEY as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: CLIENT_MESSAGE.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: CLIENT_MESSAGE.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await database.users.findOne({ email: value })
            if (user === null) {
              throw new Error(CLIENT_MESSAGE.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
