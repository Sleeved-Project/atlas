export enum PaymentIntentStatus {
  FAILED = 'payment_failed',
  PROCESSING = 'processing',
  CANCELED = 'canceled',
  SUCCEEDED = 'succeeded',
  CREATED = 'created',
}

export interface PaymentIntentBuyerInfosOutputDTO {
  username: string
  profilePictureUrl: string | null
}
