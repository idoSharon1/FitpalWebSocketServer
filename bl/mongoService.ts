import Chat, {IChat} from "../dal/models/chatModel";

class ChatService {
    async createChat(chatID: string, user1: string, user2: string): Promise<IChat> {
        const chat = new Chat();
        chat.id = chatID
        chat.users = [user1, user2]
        return await chat.save();
    }

    async findChatById(id: string): Promise<IChat | null> {
        return await Chat.findOne({ id });
    }

    async getAllChats(): Promise<IChat[]> {
        return await Chat.find();
    }

    async addMessageToChat(chatId: string, text: string, sendingUser: string): Promise<IChat | null> {
        const chat = await Chat.findOne({ id: chatId });
        if (!chat) return null;

        chat.messages.push({ text, sendingUser });
        await chat.save();
        return chat;
    }

    async deleteChat(chatId: string): Promise<boolean> {
        const result = await Chat.deleteOne({ id: chatId });
        return result.deletedCount > 0;
    }
}

export default ChatService;
