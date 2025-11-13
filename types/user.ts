import { Product } from "./product";

export interface User {
    id: number,
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    products: Product[] | []
}