import clientPromise from "@/lib/mongodb";
import { initDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    const db = await initDB();
    const result = await db.collection("produk").find().toArray()
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const db = await initDB();
    const body = await req.json();
    const result = await db.collection("produk").insertOne(body);
    return NextResponse.json(result);
}

export async function DELETE(req: Request, { params } : { params: {id : number} }) {
    const db = await initDB();  
    await db.collection("produk").deleteOne({
        id: params.id
    });
    return NextResponse.json({ message: "Deleted" });
}
