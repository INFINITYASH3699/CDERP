"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/superadmin/Sidebar";

const SuperAdmin = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    if (!token) {
      router.push("/AdminLogin");
      return;
    }

    if (role !== "SuperAdmin" && role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    // Redirect to dashboard by default
    router.push("/superadmin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePage="" />
      {/* Add padding-left for mobile menu button */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Loading Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading Text */}
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">Setting up your admin panel</p>
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
