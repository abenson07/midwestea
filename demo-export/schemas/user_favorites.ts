export interface UserFavorites {
  id: string;
  user_id: string;
  name: string;
  route: string;
  created_at: string;
}

export interface UserFavoritesInsert {
  user_id: string;
  name: string;
  route: string;
}
