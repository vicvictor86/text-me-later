export class CreateGroupChatResponseDto {
  whoRequestingId: string
  chatId: string
  membersId: string[]
  adminsId: string[]
  name: string
  description?: string

  createdAt: Date
  updatedAt?: Date
}
