// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               app/page.js
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { FaCar, FaTaxi, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <FaTaxi className="text-primary-600 text-3xl" />
              <span className="text-xl font-bold">Vroom</span>
            </Link>
            <div className="space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-primary-600">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Sign Up
</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Ride, Your Way</h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Get where you need to go with convenience and reliability. Sign up now and experience the best ride-sharing service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
  href="/signup" 
  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
>
              <FaSignInAlt />
              <span>Sign Up</span>
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-primary-600 border border-primary-600 px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <FaSignInAlt />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaCar className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reliable Rides</h3>
              <p className="text-gray-600">Get to your destination on time, every time with our trusted drivers.</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaCar className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Affordable Prices</h3>
              <p className="text-gray-600">Competitive rates and transparent pricing with no hidden fees.</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
                <FaCar className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe Journeys</h3>
              <p className="text-gray-600">Safety is our priority with verified drivers and real-time tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <FaTaxi className="text-primary-400 text-2xl" />
                <span className="text-xl font-bold">RideShare</span>
              </Link>
            </div>
            <div className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} RideShare. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}