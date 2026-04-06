"use client"
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import React from 'react'



function Page() {

  const {user,logout} = useUser();
const router = useRouter();
  return (
<>


{user ? (
  <div className='flex flex-col items-center justify-center h-screen gap-6'>
    <h1 className='text-2xl font-bold'>Welcome to your Dashboard, {user.name}!</h1>     
    <div className='flex gap-4'>
      <Button onClick={() => router.push("/dashboard/resume-analyzer")}>Go to Resume Analyzer</Button>
      <Button variant="outline" onClick={logout}>Logout</Button>      
    </div>
  </div>
) : ( 
  <div className='flex flex-col items-center justify-center h-screen gap-6'>
    <h1 className='text-2xl font-bold'>You are not logged in.</h1>
    <Button onClick={() => router.push("/sign-in")}>Go to Login</Button>
  </div>
)}  


</> 
  )}
export default Page