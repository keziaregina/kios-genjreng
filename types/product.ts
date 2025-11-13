import { Category } from "./category"

export interface Product {
    id: string,
    name: string,
    price: number,
    categoryId: number
    createdAt: Date
    updatedAt: Date

    category: Category
}