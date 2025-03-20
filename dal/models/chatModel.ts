import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
    text: string;
    sendingUser: string;
}

export interface IChat extends Document {
    id: string
    users: [string, string]
    messages: IMessage[]
}

const chatSchema: Schema<IChat> = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    users: {
        type: [String],
        required: true,
        validate: {
            validator: (v: string[]) => v.length === 2,
            message: 'A chat must have exactly two users.',
        },
    },
    messages: [
        {
            text: { type: String, required: true },
            sendingUser: { type: String, required: true },
        },
    ],
});

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;
