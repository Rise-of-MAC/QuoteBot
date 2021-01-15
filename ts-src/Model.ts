export type Quote = {
  _id: string;
  text: string;
  author: string;
  tags: string;
  likes: number;
  language: string;
  added: Date;
}


export type Author = {
  id: number,
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

export type Liked = {
  at: Date;
  rank: number;
}
