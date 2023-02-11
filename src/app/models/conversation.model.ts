export interface ConversationModel {
  text: string | null
  type: string;
  time: string
  link: boolean;
  question?: string;
}
