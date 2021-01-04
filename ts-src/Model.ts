export type Quote = {
  _id: string;
  text: string;
  author: Author;
  tags: string;
  likes: number;
  language: string;
  added: Date;
}


export type Author = {
  id: number;
  name: string;
}

export type Tag = {
  id: number;
  name: string;
}

export type User = {
  username?: string;
  last_name?: string;
  first_name?: string;
  id: number;
  is_bot: boolean;
  language_code?: string;
}