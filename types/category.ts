import { Product } from "./product";

export interface Category {
    id: number,
    name: string,
    createdAt: Date | null,
    updatedAt: Date | null,

    products: Product[] | []
}