import React from 'react'

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B8DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
)

const RankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B8DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const LibraryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B8DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 2v4" />
        <path d="M10 2v4" />
        <path d="M14 2v4" />
        <path d="M18 2v4" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 15v5" />
    </svg>
)

const OrganizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B8DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
)

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B8DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
)

const whyCards = [
    {
        icon: <LockIcon />,
        title: "Free to Use. No Paywalls.",
        description: "Create your gaming profile, track games, and rate titles — completely free, forever.",
    },
    {
        icon: <RankIcon />,
        title: "Your Gamer Rank Evolves",
        description: "Earn ranks based on how many games you've played and completed — your profile grows with you.",
    },
    {
        icon: <LibraryIcon />,
        title: "A Massive Game Library",
        description: "Explore thousands of games across every platform. Powered by the RAWG API.",
    },
    {
        icon: <OrganizeIcon />,
        title: "Organize Games Your Way",
        description: "Played, currently playing, wishlist, dropped — keep your games exactly how you like.",
    },
    {
        icon: <ShareIcon />,
        title: "One Profile. Share Anywhere.",
        description: "Share your GamersDex profile with friends or keep it private — you're in control.",
    },
]

const WhyCard = ({ icon, title, description }) => {
    return (
        <div
            style={{
                borderRadius: '14.686px',
                border: '0.459px solid rgba(139, 141, 255, 0.20)',
                background: 'linear-gradient(180deg, rgba(139, 141, 255, 0.12) 0%, rgba(139, 141, 255, 0.04) 50%, rgba(139, 141, 255, 0.07) 100%)',
                backdropFilter: 'blur(19.275px)',
                minHeight: '220px',
            }}
            className="p-5 sm:p-7 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,141,255,0.15)]"
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, rgba(139, 141, 255, 0.25) 0%, rgba(139, 141, 255, 0.10) 100%)',
                    border: '0.5px solid rgba(139, 141, 255, 0.25)',
                }}
            >
                {icon}
            </div>
            <h3 className="text-white font-poppins text-lg font-semibold">
                {title}
            </h3>
            <p className="text-[#a0a3c1] font-poppins text-sm leading-relaxed">
                {description}
            </p>
        </div>
    )
}

const Why = () => {
    return (
        <section className="w-full py-14 sm:py-20 px-4" style={{ background: 'transparent' }} id='why'>
            <div className="w-full sm:w-[90%] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5" style={{ gridAutoRows: '1fr' }}>
                    {/* Box 1 — Title area (no card styling) */}
                    <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left gap-4 p-5 sm:p-7" style={{ minHeight: '180px' }}>
                        <h2
                            className="font-almendra text-2xl sm:text-3xl md:text-4xl leading-tight"
                            style={{
                                background: 'linear-gradient(87deg, #ECEEFF 17.24%, #B7B9E6 94.36%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Why GamersDex?
                        </h2>
                        <p className="text-[#a0a3c1] font-poppins text-sm leading-relaxed max-w-[280px]">
                            Everything a gamer needs — in one place, built for you.
                        </p>
                    </div>

                    {/* Boxes 2-3 — First row remaining cards */}
                    {whyCards.slice(0, 2).map((card, index) => (
                        <WhyCard key={index} icon={card.icon} title={card.title} description={card.description} />
                    ))}

                    {/* Boxes 4-6 — Second row cards */}
                    {whyCards.slice(2, 5).map((card, index) => (
                        <WhyCard key={index + 2} icon={card.icon} title={card.title} description={card.description} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Why