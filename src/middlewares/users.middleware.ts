import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { CLIENT_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import database from '~/services/database.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validator'

export const loginMiddleware = validate(
  checkSchema({
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
          const user = await database.user.findOne({ email: value, password: hashPassword(req.body.password) })
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
  })
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
