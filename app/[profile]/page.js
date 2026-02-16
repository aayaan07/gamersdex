'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Link from 'next/link';

export default function ProfilePage({ params }) {
    const { user } = useAuth();
    const usernameParam = React.use(params).profile;
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasGivenAura, setHasGivenAura] = useState(false);
    const [auraLoading, setAuraLoading] = useState(false);

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const q = query(collection(db, "users"), where("username", "==", usernameParam));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0];
                    setProfileUser({ id: docData.id, ...docData.data() });
                } else {
                    setProfileUser(null);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (usernameParam) {
            fetchProfile();
        }
    }, [usernameParam]);

    // Check if current user has given aura
    useEffect(() => {
        const checkAuraStatus = async () => {
            if (user && profileUser) {
                const auraDocRef = doc(db, "users", profileUser.id, "auraGiven", user.uid);
                const auraSnap = await getDoc(auraDocRef);
                if (auraSnap.exists()) {
                    setHasGivenAura(true);
                }
            }
        };
        checkAuraStatus();
    }, [user, profileUser]);


    const handleGiveAura = async () => {
        if (!user) {
            alert("You must be logged in to give Aura.");
            return;
        }
        if (user.uid === profileUser.id) {
            alert("You cannot give aura to yourself.");
            return;
        }
        if (hasGivenAura) return;

        setAuraLoading(true);
        try {
            const userRef = doc(db, "users", profileUser.id);
            const currentUserRef = doc(db, "users", user.uid); // Reference to giver's doc
            const auraRef = doc(db, "users", profileUser.id, "auraGiven", user.uid);

            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(userRef);
                const currentUserDoc = await transaction.get(currentUserRef);

                if (!sfDoc.exists() || !currentUserDoc.exists()) {
                    throw "Document does not exist!";
                }

                // Check if already given in transaction for safety
                const auraDoc = await transaction.get(auraRef);
                if (auraDoc.exists()) {
                    throw "Already given aura to this user";
                }

                // --- Daily Limit Logic ---
                const giverData = currentUserDoc.data();
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

                let dailyCount = giverData.dailyAuraCount || 0;
                const lastReset = giverData.lastAuraReset;

                // Reset logic if it's a new day
                if (lastReset !== todayStr) {
                    dailyCount = 0;
                }

                if (dailyCount >= 3) {
                    throw "Daily aura limit reached (3/3)";
                }

                // Update Recipient
                const newAura = (sfDoc.data().aura || 0) + 1;
                transaction.update(userRef, { aura: newAura });
                transaction.set(auraRef, { timestamp: Date.now() });

                // Update Giver
                transaction.update(currentUserRef, {
                    dailyAuraCount: dailyCount + 1,
                    lastAuraReset: todayStr
                });
            });

            setProfileUser(prev => ({ ...prev, aura: (prev.aura || 0) + 1 }));
            setHasGivenAura(true);
        } catch (error) {
            console.error("Transaction failed: ", error);
            if (error === "Daily aura limit reached (3/3)") {
                alert("You have reached your daily limit of 3 Auras.");
            } else if (error !== "Already given aura to this user") {
                alert("Failed to give Aura. " + error);
            }
        } finally {
            setAuraLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!profileUser) {
        return <div className="min-h-screen flex items-center justify-center text-white">User not found</div>;
    }

    // derived state for games
    const playingGames = profileUser.games?.filter(g => g.status === 'playing') || [];
    const completedGames = profileUser.games?.filter(g => g.status === 'completed') || [];
    const droppedGames = profileUser.games?.filter(g => g.status === 'dropped') || [];
    const wishlistGames = profileUser.games?.filter(g => g.status === 'wishlist') || [];

    // Rank System Logic
    const getRank = (count, isOwner) => {
        if (isOwner) return {
            name: 'Architect of Realms',
            color: '#00F5FF',
            border: 'border-[#00F5FF]/50',
            bg: 'bg-gradient-to-r from-[#00F5FF]/10 to-[#8B5CF6]/10',
            shadow: 'shadow-[0_0_20px_rgba(0,245,255,0.4)] animate-glow-pulse',
            special: true
        };
        if (count >= 250) return { name: 'Mythic Overlord', color: '#FACC15', border: 'border-[#FACC15]/20', bg: 'bg-[#FACC15]/10', shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]' };
        if (count >= 175) return { name: 'Legend', color: '#EF4444', border: 'border-[#EF4444]/20', bg: 'bg-[#EF4444]/10', shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' };
        if (count >= 125) return { name: 'Grandmaster', color: '#8B5CF6', border: 'border-[#8B5CF6]/20', bg: 'bg-[#8B5CF6]/10', shadow: 'shadow-[0_0_10px_rgba(139,92,246,0.3)]' };
        if (count >= 75) return { name: 'Master of Realms', color: '#F97316', border: 'border-[#F97316]/20', bg: 'bg-[#F97316]/10', shadow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' };
        if (count >= 40) return { name: 'Diamond Dominator', color: '#06B6D4', border: 'border-[#06B6D4]/20', bg: 'bg-[#06B6D4]/10', shadow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]' };
        if (count >= 30) return { name: 'Platinum Phantom', color: '#3B82F6', border: 'border-[#3B82F6]/20', bg: 'bg-[#3B82F6]/10', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]' };
        if (count >= 20) return { name: 'Gold Conqueror', color: '#FFD700', border: 'border-[#FFD700]/20', bg: 'bg-[#FFD700]/10', shadow: 'shadow-[0_0_10px_rgba(255,215,0,0.3)]' };
        if (count >= 11) return { name: 'Silver Slayer', color: '#C0C0C0', border: 'border-[#C0C0C0]/20', bg: 'bg-[#C0C0C0]/10', shadow: 'shadow-none' };
        if (count >= 4) return { name: 'Bronze Hunter', color: '#CD7F32', border: 'border-[#CD7F32]/20', bg: 'bg-[#CD7F32]/10', shadow: 'shadow-none' };
        return { name: 'Rookie', color: '#6B7280', border: 'border-[#6B7280]/20', bg: 'bg-[#6B7280]/10', shadow: 'shadow-none' };
    };

    const rank = getRank(completedGames.length, profileUser.username === 'blazeonix');

    return (
        <div className="min-h-screen w-full text-white font-poppins relative overflow-hidden selection:bg-pink-500/30">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>

                {/* Placeholder for noise texture if available, else just subtle texture */}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">

                {/* Header Section */}
                <header className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 bg-[#151725]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">

                        <div className="flex items-center justify-center">
                            <div className={`w-40 h-40 lg:w-56 lg:h-56 bg-black rounded-2xl border-2 border-white/10 overflow-hidden relative group shrink-0`}>
                                {profileUser.photoURL ? (
                                    <img
                                        src={profileUser.photoURL}
                                        alt={profileUser.username}
                                        className="w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <>
                                        {/* Placeholder Avatar */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs text-center p-2">
                                            Avatar
                                        </div>
                                        {/* Simulate the sketch look from screenshot */}
                                        <svg className="absolute inset-0 w-full h-full text-white p-4" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="50" cy="40" r="15" />
                                            <line x1="50" y1="55" x2="50" y2="80" />
                                            <line x1="50" y1="80" x2="30" y2="100" />
                                            <line x1="50" y1="80" x2="70" y2="100" />
                                            <line x1="30" y1="60" x2="70" y2="60" />
                                        </svg>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col items-center md:items-start space-y-3 text-center md:text-left">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
                                    {usernameParam || 'User'}
                                    {rank.special && (
                                        <span className="text-[#00F5FF] animate-pulse" title="Architect of Realms">
                                            👑
                                        </span>
                                    )}
                                </h1>
                                <span
                                    className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${rank.bg} ${rank.border} ${rank.shadow} ${rank.special ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] via-[#D946EF] to-[#00F5FF] animate-gradient-x font-bold tracking-wide' : ''}`}
                                    style={{ color: rank.special ? undefined : rank.color }}
                                >
                                    &lt; {rank.name} &gt;
                                </span>
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                                {profileUser.bio || "Gaming through different genres, one title at a time."}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Joined {profileUser.joinedAt?.toDate ? profileUser.joinedAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                {/* Discord Icon - Copy to Clipboard */}
                                {profileUser.discordId && (
                                    <div
                                        onClick={() => { navigator.clipboard.writeText(profileUser.discordId); alert("Discord ID copied!"); }}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#5865F2] hover:text-white transition-colors cursor-pointer overflow-hidden p-1.5"
                                        title={profileUser.discordId}
                                    >
                                        <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord" className="w-full h-full object-contain" />
                                    </div>
                                )}

                                {/* Steam Icon - Link */}
                                {profileUser.steamId && (
                                    <Link
                                        href={profileUser.steamId}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#171a21] hover:text-white transition-colors cursor-pointer overflow-hidden p-1.5"
                                    >
                                        <img src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/steam-7tmhpbwzco485ew3p66mh.png/steam-ghlhjssxznri21c5tax15n.png?_a=DATAiZAAZAA0" alt="Steam" className="w-full h-full object-contain" />
                                    </Link>
                                )}
                            </div>

                            <div className="mt-2 text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Aura · {profileUser.aura || 0}
                            </div>
                        </div>
                    </div>

                    {/* Stats & Buttons */}
                    <div className="w-full lg:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Stats Box & Buttons */}
                        <div className="flex flex-col gap-3 w-full">
                            <div className="bg-[#1c1e30]/50 rounded-xl p-4 border border-white/5 space-y-3 flex-1 flex flex-col justify-center min-w-[140px]">
                                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Completed</span>
                                    <span className="text-green-400 font-bold">{completedGames.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Dropped</span>
                                    <span className="text-red-400 font-bold">{droppedGames.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Wishlist</span>
                                    <span className="text-yellow-400 font-bold">{wishlistGames.length}</span>
                                </div>
                            </div>

                            {/* Buttons Area - Aura and Share */}
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={handleGiveAura}
                                    disabled={hasGivenAura || auraLoading || !user || user.uid === profileUser.id}
                                    className={`w-full py-2 text-sm rounded-lg font-bold transition-all ${hasGivenAura
                                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                                        : "btn-primary"
                                        }`}
                                >
                                    {hasGivenAura ? "Aura Given" : auraLoading ? "..." : "+ Give Aura"}
                                </button>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Profile URL copied to clipboard!"); }}
                                    className="btn-sec w-full py-2 text-sm"
                                >
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Favorite Game Box */}
                        {profileUser.favoriteGame ? (
                            <>
                                <div className="relative rounded-xl overflow-hidden border border-white/5 group h-full min-h-[160px] w-full md:w-[200px] mx-auto hidden md:block">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url('${profileUser.favoriteGame.background_image}')`,
                                            filter: "brightness(0.6)"
                                        }}>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Favorite Game</div>
                                        <div className="text-sm font-bold text-white leading-tight">{profileUser.favoriteGame.name}</div>
                                        <div className="flex gap-1 mt-1">
                                            <span className="text-[10px] text-orange-500">🔥🔥🔥🔥🔥</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Mobile visible Favorite Game - simpler version */}
                                <div className="md:hidden relative rounded-xl overflow-hidden border border-white/5 h-[100px] w-full flex items-center p-4 bg-[#1c1e30]/50">
                                    <div className="w-16 h-16 rounded-lg bg-cover bg-center mr-4" style={{ backgroundImage: `url('${profileUser.favoriteGame.background_image}')` }}></div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Favorite Game</div>
                                        <div className="text-sm font-bold text-white leading-tight">{profileUser.favoriteGame.name}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex flex-col items-center justify-center p-4 border border-white/5 rounded-xl bg-[#1c1e30]/30 text-white/30 text-xs text-center">
                                No favorite game selected
                            </div>
                        )}

                    </div>
                </header>

                {/* Currently Playing Section - Grid Upgrade */}
                <section>
                    <h2 className="text-2xl font-playball text-white/90 mb-4 border-b border-white/10 pb-2 inline-block px-2 italic">
                        Currently Playing
                    </h2>
                    {/* 3 columns grid for smaller cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {playingGames.length > 0 ? playingGames.map((game, idx) => (
                            <div key={idx} className="w-full h-48 md:h-56 rounded-2xl overflow-hidden relative border border-white/10 group shadow-lg">
                                {/* Banner Image */}
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${game.background_image || game.coverImage}')`
                                    }}>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>

                                {/* Logo Overlay */}
                                <div className="absolute bottom-6 left-6">
                                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg uppercase tracking-wider font-jersey">
                                        {game.name || game.title}
                                    </h3>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm">Not playing anything right now.</p>
                        )}
                    </div>
                </section>

                {/* Games Completed Grid */}
                <section>
                    <h2 className="text-2xl font-playball text-white/90 mb-4 border-b border-white/10 pb-2 inline-block px-2 italic">
                        Games Completed
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {completedGames.length > 0 ? completedGames.map((game, i) => (
                            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden relative group border border-white/5 bg-[#1a1c2e]">
                                <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        backgroundImage: `url('${game.background_image || game.coverImage}')`
                                    }}>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                                    <span className="text-xs font-bold text-white line-clamp-2">{game.name || game.title}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="col-span-full text-gray-500 text-sm">No games completed yet.</p>
                        )}
                    </div>
                </section>

                {/* Wishlist Grid - No Grayscale */}
                <section>
                    <h2 className="text-2xl font-playball text-white/90 mb-4 border-b border-white/10 pb-2 inline-block px-2 italic">
                        Wishlist
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {wishlistGames.length > 0 ? wishlistGames.map((game, i) => (
                            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden relative group border border-white/5 bg-[#1a1c2e]">
                                <div className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        backgroundImage: `url('${game.background_image || game.coverImage}')`
                                    }}>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                                    <span className="text-xs font-bold text-white line-clamp-2">{game.name || game.title}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="col-span-full text-gray-500 text-sm">Wishlist is empty.</p>
                        )}
                    </div>
                </section>

                {/* Games Dropped - Minimal List */}
                <section className="mb-20">
                    <h2 className="text-2xl font-playball text-white/90 mb-4 border-b border-white/10 pb-2 inline-block px-2 italic">
                        Games Dropped
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {droppedGames.length > 0 ? droppedGames.map((game, i) => (
                            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden relative group border border-white/5 bg-[#1a1c2e]">
                                <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        backgroundImage: `url('${game.background_image || game.coverImage}')`
                                    }}>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                                    <span className="text-xs font-bold text-white line-clamp-2">{game.name || game.title}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-6 opacity-60">
                                <p className="font-playball text-xl lg:text-2xl text-pink-200/80">
                                    "Looks like every game was worth finishing — solid taste."
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section - Minimal */}
                <section className="py-8 mt-12 mb-4 border-t border-white/5 flex flex-col items-center text-center">
                    <p className="text-gray-400 text-sm mb-4">
                        Want a profile like this?
                    </p>
                    <a href="/create" className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-full transition-all hover:scale-105">
                        Create Your Profile
                    </a>
                </section>



            </div >
        </div >
    );
}
