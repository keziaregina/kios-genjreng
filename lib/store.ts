export const MAX_STORE_NAME_LENGTH = 40;
export const MAX_CITY_LENGTH = 40;

// A store identity only replaces the personal name once both halves are set, so a half-filled row still reads as a name.
export function storeLabel(user: {
  storeName: string | null;
  city: string | null;
  name: string;
}): string {
  return user.storeName && user.city ? `${user.storeName}_${user.city}` : user.name;
}
