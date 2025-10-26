import { Product as ProductType } from "@/types/product";
import ProductForm from "./components/Form";

export default async function Product() {
  const res = await fetch("http://localhost:3000/api/product", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch produk");
  }

  const products: ProductType[] = await res.json();

  return (
    <div>
      <h1>hello world!</h1>
      {products.map((item) => (
        <li key={item._id}>{item.name}</li>
      ))}

      <ProductForm />
    </div>
  );
}    