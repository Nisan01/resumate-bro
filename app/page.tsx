"use client";

import Header from "@/components/LandingPage/Header";
import Footer from "@/components/LandingPage/Footer";
import Main from "@/components/LandingPage/Main";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

export default function LandingPage() {

const {logout}=useUser();

  return (
    <>

      <Header />
      <Main />
      <Footer />
    </>
  );
}