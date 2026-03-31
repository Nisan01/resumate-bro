"use client";
import Image from "next/image";
import { useUser } from "../context/UserContext";

export default function Navbar() {
  const { user, loading, logout } = useUser();

  if (loading) return <p>Loading...</p>;

  // fallback to dicebear if no avatarUrl
  const avatar = user?.avatarUrl ?? `https://api.dicebear.com/9.x/pixel-art/svg?seed=Alex`;

  return (
    <nav>
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
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/sign-in">Login</a>
      )}
    </nav>
  );
}