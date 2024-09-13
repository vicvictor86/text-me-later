import { CreateGroupChatResponseDto } from '@/modules/chat/dtos/create-group-chat-response.dto'
import { GroupChat } from '../../mongoose/schemas/group-chat'

export class GroupChatPresenter {
  static toHTTP(
    groupChat: GroupChat,
    userId: string,
  ): CreateGroupChatResponseDto {
    const membersId = groupChat.members.map((member) => {
      return member.toString()
    })

    const adminsId = groupChat.admins.map((admin) => {
      return admin.toString()
    })

    return {
      whoRequestingId: userId,
      chatId: groupChat._id.toString(),
      membersId,
      adminsId,
      name: groupChat.name,
      description: groupChat.description,
      createdAt: groupChat.createdAt,
      updatedAt: groupChat.updatedAt,
    }
  }
}
