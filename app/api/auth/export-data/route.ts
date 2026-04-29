import { NextResponse } from "next/server";
import { updateUserPassword } from "@/utils/db/db-operations/change-pass/update";
import { exportUserData } from "@/utils/db/db-operations/data-export/export";


export async function POST(req:Request) {

    try {
           const {userId} = await req.json();

  

    const res=await exportUserData(userId);

    return NextResponse.json({
        success: res.success,
        message: res.message,
        data: res.data       
    });

        
    } catch (error) {
        console.error("Error exporting user data:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while exporting user data."
        }, { status: 500 });
    }

 






}