export interface IUserClient {
  user_avatar?: string;
  username: string;
  name: string;
  location?: string;
  bio?: string;
  email: string;
  links?: [];
  linked_by: [];
  linked_to: [];
  isLinked?: boolean;
}
