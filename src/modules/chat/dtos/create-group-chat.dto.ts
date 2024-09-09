export class CreateGroupChatDto {
  whoRequestingId: string
  members: string[]
  name: string
  description?: string
}
