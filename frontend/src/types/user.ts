export interface IUserClient {
  user_avatar?: string;
  username: string;
  name: string;
  location?: string;
  bio?: string;
  email: string;
  links?: number;
  linked_by: number;
  linked_to: number;
  isLinked?: boolean;
}
