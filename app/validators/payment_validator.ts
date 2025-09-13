import vine from '@vinejs/vine'
import { baseParamsSchema } from './common_validator.js'

export const paymentSchemaValidator = vine.compile(baseParamsSchema)
