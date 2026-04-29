
import { NextResponse } from "next/server";
import { deleteAccount } from "@/utils/db/db-operations/user";

export async function POST(req:Request) {

    try {
           const {userId} = await req.json();

 

    const res=await deleteAccount( userId);

    return NextResponse.json({
        success: res.success,
        message: res.message            
    });

        
    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while deleting the account."
        }, { status: 500 });
    }

 






}