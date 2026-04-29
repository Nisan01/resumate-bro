
import { updateTargetsProfile } from "@/utils/db/db-operations/user";

export async function POST(req:Request){

try {

    const targetData=await req.json();
    const {userId,updateData}=targetData;

    const result=await updateTargetsProfile(userId,updateData);


    if(!result.success){
        return Response.json({ success: false, message: result.message }, { status: result.status });
    }   
    return Response.json({ success: true, message: "Target profile updated successfully." });
    
} catch (error) {
    console.error("Error updating target profile:", error);
    return Response.json({ success: false, message: "An error occurred while updating the target profile." }, { status: 500 });
}




}