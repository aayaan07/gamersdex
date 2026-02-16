"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import TermsModal from './TermsModal'
import PrivacyModal from './PrivacyModal'

const Footer = () => {
    const [isTermsOpen, setIsTermsOpen] = useState(false)
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

    return (
        <footer className="w-full py-8 sm:py-10 px-4" style={{ background: 'transparent' }}>
            <div className="w-[90%] sm:w-[80%] md:w-[70%] mx-auto">
                {/* Top row — Logo + Nav links */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8"
                    style={{ borderBottom: '1px solid rgba(139, 141, 255, 0.15)' }}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 no-underline transition-opacity duration-300 hover:opacity-80"
                    >
                        <img src="/logo.png" alt="logo" className="w-10 h-auto" />
                        <span className="font-jersey text-2xl text-white font-normal tracking-wide">
                            GamersDex
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-5 sm:gap-8">
                        <Link href="/" className="font-poppins text-sm text-white/60 no-underline transition-colors duration-300 hover:text-white">
                            Home
                        </Link>
                        <Link href="/create" className="font-poppins text-sm text-white/60 no-underline transition-colors duration-300 hover:text-white">
                            Create
                        </Link>
                        <Link href="/top-10" className="font-poppins text-sm text-white/60 no-underline transition-colors duration-300 hover:text-white">
                            Top 10
                        </Link>
                    </div>
                </div>

                {/* Bottom row — Copyright & Legal */}
                <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="font-poppins text-xs text-white/40 text-center md:text-left">
                        © {new Date().getFullYear()} GamersDex. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsTermsOpen(true)}
                            className="font-poppins text-xs text-white/40 hover:text-white transition-colors"
                        >
                            Terms of Service
                        </button>
                        <button
                            onClick={() => setIsPrivacyOpen(true)}
                            className="font-poppins text-xs text-white/40 hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </button>
                    </div>
                </div>
            </div>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        </footer>
    )
}

export default Footer
