"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, userData, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-transparent w-full h-fit flex flex-wrap items-center justify-between px-4 sm:px-8 py-5 relative z-50">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 no-underline transition-opacity duration-300 hover:opacity-80"
      >
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="logo" className="w-10 sm:w-14 h-auto" />
        </div>
        <span className="font-jersey text-[26px] sm:text-[32px] text-white font-normal tracking-wide">
          GamersDex
        </span>
      </Link>

      {/* Hamburger button — visible on mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Nav links + Sign In — hidden on mobile unless menu open */}
      <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-fit mt-4 md:mt-0`}>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
          <Link
            href="/"
            className="font-poppins text-[0.95rem] font-medium text-white/80 no-underline transition-colors duration-300 hover:text-white hover:bg-white/8 p-2 rounded-md"
          >
            Home
          </Link>
          <Link
            href="/create"
            className="font-poppins text-[0.95rem] font-medium text-white/80 no-underline transition-colors duration-300 hover:text-white hover:bg-white/8 p-2 rounded-md"
          >
            {userData?.username ? "Edit" : "Create"}
          </Link>
          <Link
            href="/top-10"
            className="font-poppins text-[0.95rem] font-medium text-white/80 no-underline transition-colors duration-300 hover:text-white hover:bg-white/8 p-2 rounded-md"
          >
            Top 10
          </Link>
        </div>

        <div className="flex items-center relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={userData?.avatarUrl || user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-white/20 object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#151725] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm text-white font-medium truncate">{userData?.username || user.displayName}</p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>

                  {userData?.username ? (
                    <Link
                      href={`/${userData.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>
                  ) : (
                    <Link
                      href="/create"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Create Profile
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={login} className="btn-primary btn">Sign In</button>
          )}
        </div>
      </div>
    </nav>
  );
}
