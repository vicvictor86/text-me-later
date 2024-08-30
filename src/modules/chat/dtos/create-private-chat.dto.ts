export class CreatePrivateChatRepositoryDto {
  user1Id: string
  user2Id: string
  titleUser1: string
  titleUser2: string
}

export class CreatePrivateChatServiceDto {
  whoRequestingId: string
  user1Id: string
  user2Id: string
}
