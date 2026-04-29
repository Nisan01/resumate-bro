
import { NextResponse } from "next/server";
import { updateAvatar } from "@/utils/db/db-operations/change-pass/update";

interface UpdateAvatarRequest {
  userId: string;    
  avatarUrl: string; 
}

export async function POST(req:Request) {

    try {
           const {avatarUrl, userId} = await req.json();

    const userData = {
        avatarUrl,
        userId  
    };

    const res=await updateAvatar(userId, avatarUrl);

    return NextResponse.json({
        success: res.success,
        message: res.message            
    });

        
    } catch (error) {
        console.error("Error updating avatar:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred while updating the avatar."
        }, { status: 500 });
    }

 






}