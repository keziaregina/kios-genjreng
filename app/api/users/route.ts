import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch (err) {
        return NextResponse.json({
            message: "Failed to fetch users",
        }, {
            status: 500,
        })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        const newUser = await prisma.user.create({
            data: {
                name,
                email, 
                password
            }
        });

        return NextResponse.json(newUser, {status: 200});
    } catch (err) {
        return NextResponse.json({
            message: "Failed to create user",
        }, {
            status: 500,
        })
    }
}

export async function DELETE(request: Request, { params } : { params: {id : number} }) {
    try {
        const id = params.id;

        const deletedUser = await prisma.user.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json(deletedUser, {status: 200});
    } catch (err) {
        return NextResponse.json({
            message: "Failed to delete user",
        }, {
            status: 500,
        })
    }
}