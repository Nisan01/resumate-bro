import { NextResponse } from "next/server";
import { updateUserPassword } from "@/utils/db/db-operations/change-pass/update";
import { resetUserData } from "@/utils/db/db-operations/data-reset/resetdata";

export async function POST(req:Request) {

    try {
           const {userId} = await req.json();

  

    const res=await resetUserData(userId);

    return NextResponse.json({
        success: res.success,
        message: res.message,
           
    });

        
    } catch (error) {
        console.error("Error exporting user data:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while exporting user data."
        }, { status: 500 });
    }

 






}