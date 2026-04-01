"use client";
import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function Page() {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  const avatar = user?.avatarUrl ?? `https://api.dicebear.com/9.x/pixel-art/svg?seed=Alex`;

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in"); // redirect immediately after logout
  };

  return (
    <>
      <nav className="flex items-center justify-between p-4 bg-gray-100">
        {user ? (
          <>
            <Image
              src={avatar}
              alt={user.name}
              width={36}
              height={36}
              loading="eager"
              priority
              className="rounded-full"
            />
            <span>Hello, {user.name}</span>

            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <a href="/sign-in">Login</a>
        )}
      </nav> 
    </>
  )
}

export default Page;