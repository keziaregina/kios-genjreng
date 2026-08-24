/** Values `StoreForm` submits to `updateStore`. */
export type StoreInput = {
  storeName: string;
  city: string;
};

/** Shelf-wide numbers `storeStats` derives from one merchant's product rows. */
export type StoreStats = {
  productCount: number;
  soldCount: number;
  reviewCount: number;
  rating: number | null;
};
