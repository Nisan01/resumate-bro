import { NextResponse } from "next/server";
import { updateUserPassword } from "@/utils/db/db-operations/change-pass/update";


export async function POST(req:Request) {

    try {
           const {currentPassword, newPassword, userId} = await req.json();

    const userData = {
        currentPassword,
        newPassword,
        userId  
    };

    const res=await updateUserPassword(userData);

    return NextResponse.json({
        success: res.success,
        message: res.message            
    });

        
    } catch (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while updating the password."
        }, { status: 500 });
    }

 






}