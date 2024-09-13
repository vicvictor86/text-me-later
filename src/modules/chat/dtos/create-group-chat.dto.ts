export class CreateGroupChatDto {
  whoRequestingId: string
  membersId: string[]
  name: string
  description?: string
}
