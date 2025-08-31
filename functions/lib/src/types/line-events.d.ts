export interface LineWebhookRequest {
    destination: string;
    events: LineEvent[];
}
export type LineEvent = LineMessageEvent | LinePostbackEvent | LineFollowEvent | LineUnfollowEvent;
export interface LineMessageEvent {
    type: 'message';
    mode: 'active' | 'standby';
    timestamp: number;
    source: LineUser | LineGroup | LineRoom;
    webhookEventId: string;
    deliveryContext: {
        isRedelivery: boolean;
    };
    replyToken: string;
    message: LineMessage;
}
export interface LinePostbackEvent {
    type: 'postback';
    mode: 'active' | 'standby';
    timestamp: number;
    source: LineUser | LineGroup | LineRoom;
    webhookEventId: string;
    deliveryContext: {
        isRedelivery: boolean;
    };
    replyToken: string;
    postback: {
        data: string;
        params?: {
            date?: string;
            time?: string;
            datetime?: string;
        };
    };
}
export interface LineFollowEvent {
    type: 'follow';
    mode: 'active' | 'standby';
    timestamp: number;
    source: LineUser | LineGroup | LineRoom;
    webhookEventId: string;
    deliveryContext: {
        isRedelivery: boolean;
    };
    replyToken: string;
}
export interface LineUnfollowEvent {
    type: 'unfollow';
    mode: 'active' | 'standby';
    timestamp: number;
    source: LineUser | LineGroup | LineRoom;
    webhookEventId: string;
    deliveryContext: {
        isRedelivery: boolean;
    };
}
export type LineMessage = LineTextMessage | LineStickerMessage | LineImageMessage | LineVideoMessage | LineAudioMessage | LineFileMessage | LineLocationMessage;
export interface LineTextMessage {
    id: string;
    type: 'text';
    quoteToken?: string;
    text: string;
    emojis?: LineEmoji[];
    mention?: LineMention;
}
export interface LineStickerMessage {
    id: string;
    type: 'sticker';
    quoteToken?: string;
    packageId: string;
    stickerId: string;
    stickerResourceType: 'STATIC' | 'ANIMATION' | 'SOUND' | 'ANIMATION_SOUND' | 'POPUP' | 'POPUP_SOUND' | 'CUSTOM' | 'MESSAGE';
    keywords?: string[];
    text?: string;
}
export interface LineImageMessage {
    id: string;
    type: 'image';
    quoteToken?: string;
    contentProvider?: {
        type: 'line' | 'external';
        originalContentUrl?: string;
        previewImageUrl?: string;
    };
    imageSet?: {
        id: string;
        index: number;
        total: number;
    };
}
export interface LineVideoMessage {
    id: string;
    type: 'video';
    quoteToken?: string;
    duration: number;
    contentProvider?: {
        type: 'line' | 'external';
        originalContentUrl?: string;
        previewImageUrl?: string;
    };
}
export interface LineAudioMessage {
    id: string;
    type: 'audio';
    quoteToken?: string;
    duration: number;
    contentProvider?: {
        type: 'line' | 'external';
        originalContentUrl?: string;
    };
}
export interface LineFileMessage {
    id: string;
    type: 'file';
    quoteToken?: string;
    fileName: string;
    fileSize: number;
}
export interface LineLocationMessage {
    id: string;
    type: 'location';
    quoteToken?: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
}
export interface LineUser {
    type: 'user';
    userId: string;
}
export interface LineGroup {
    type: 'group';
    groupId: string;
    userId?: string;
}
export interface LineRoom {
    type: 'room';
    roomId: string;
    userId?: string;
}
export interface LineEmoji {
    index: number;
    productId: string;
    emojiId: string;
}
export interface LineMention {
    mentionees: {
        index: number;
        length: number;
        type: 'user';
        userId: string;
    }[];
}
export interface LineTextReplyMessage {
    type: 'text';
    text: string;
    emojis?: LineEmoji[];
    quoteToken?: string;
}
export interface LineStickerReplyMessage {
    type: 'sticker';
    packageId: string;
    stickerId: string;
    quoteToken?: string;
}
export interface LineFlexReplyMessage {
    type: 'flex';
    altText: string;
    contents: Record<string, unknown>;
    quoteToken?: string;
}
export type LineReplyMessage = LineTextReplyMessage | LineStickerReplyMessage | LineFlexReplyMessage;
//# sourceMappingURL=line-events.d.ts.map