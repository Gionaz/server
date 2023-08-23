export interface UserProps {
  image: string;
  userName: string;
  fullName: string;
  email: string;
  followings: number;
  followers: number;
  bio: string;
  _id: string;
  following: boolean;
  devices: DeviceProps[];
}
export type SocialFeed = {
  _id: string;
  postedBy: UserProps;
  liked: boolean;
  createdAt: Date;
  coverImageUrl: string;
  likes: number;
};
export type NotificationProps = {
  _id?: string;
  recipient: UserProps | string;
  recipients?: UserProps | string;
  sender: UserProps | string;
  message: string;
  body: string;
  title: string;
  createdAt: Date;
  read: boolean;
  viewed: boolean;
  notificationType: string;
};
export interface DeviceProps {
  name: string;
  active: boolean;
  device_id: string;
  registration_id: string;
  type: "ios" | "android";
}
export interface SendEmailProps {
  recipients: string[];
  text: string;
  subject: string;
  senderEmailAdress: string;
  html: string;
}

export interface PushNotificationProps {
  title: string;
  body: string;
  data: any;
  to: string[];
}
export interface PushNotesProps {
  sender: string;
  recipient?: string 
  recipients?: string[]
  socialFeedId?:string
  template:
    | "NEW_FOLLOWER"
    | "NEW_DAILY_CHALLENGE"
    | "NEW_DAILY_CHALLENGE_ENDED"
    | "NEW_DAILY_CHALLENGE_ABOUT_TO_ENDED"
    | "FLASH_CHALLENGE_WINNER"
    | "JOINED_HOTSPOT_CHALLENGE"
    | "NEW_LIKE";
}
export interface SocialImageProps{
  image:  string
  isCoverPhoto: boolean
  social: string
}
export interface ImageProps {
  image: string;
  _id: string;
  imageFormats: string[];
}