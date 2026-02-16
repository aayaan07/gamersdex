"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// --- Rank Logic (Duplicated for standalone page, could be util) ---
const getRank = (count, isOwner) => {
    if (isOwner) return {
        name: 'Architect of Realms',
        color: '#A855F7',
        border: 'border-[#A855F7]/50',
        bg: 'bg-gradient-to-r from-[#A855F7]/10 to-[#6366F1]/10',
        shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-glow-pulse',
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

export default function Top10Page() {
    const [activeTab, setActiveTab] = useState('aura'); // 'aura' | 'rank'
    const [users, setUsers] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let fetchedUsers = [];
                let ownerData = null;

                // Fetch ALL users first (needed for manual Rank sorting anyway)
                // Optimization: In a real large app, we would index 'completedGamesCount' and query that.
                // For now, client-side sorting is acceptable for <1000 users.
                const usersRef = collection(db, "users");
                const q = query(usersRef);
                const querySnapshot = await getDocs(q);

                const allUsers = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const completedCount = data.games?.filter(g => g.status === 'completed').length || 0;
                    return {
                        id: doc.id,
                        ...data,
                        completedCount, // Computed field
                        rankData: getRank(completedCount, data.isOwner)
                    };
                });

                // Find Owner
                ownerData = allUsers.find(u => u.username === 'blazeonix');
                setOwner(ownerData);

                if (activeTab === 'aura') {
                    // Sort by Aura DESC
                    fetchedUsers = allUsers
                        .filter(u => u.username !== 'blazeonix') // Exclude owner from main list if desired, or keep both. Usually owner is separate.
                        .sort((a, b) => (b.aura || 0) - (a.aura || 0))
                        .slice(0, 10);
                } else {
                    // Sort by Completed Games Count DESC
                    fetchedUsers = allUsers
                        .filter(u => u.username !== 'blazeonix')
                        .sort((a, b) => b.completedCount - a.completedCount)
                        .slice(0, 10);
                }

                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    return (
        <div className="min-h-screen w-full text-white font-poppins relative overflow-hidden selection:bg-pink-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
            </div>

            <Navbar />

            <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-jersey text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-8 tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    Leaderboard
                </h1>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-full mb-12 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('aura')}
                        className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'aura' ? 'bg-[#8B8DFF] text-white shadow-[0_0_20px_rgba(139,141,255,0.4)]' : 'text-white/50 hover:text-white'}`}
                    >
                        Top Aura
                    </button>
                    <button
                        onClick={() => setActiveTab('rank')}
                        className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'rank' ? 'bg-[#8B8DFF] text-white shadow-[0_0_20px_rgba(139,141,255,0.4)]' : 'text-white/50 hover:text-white'}`}
                    >
                        Top Rank
                    </button>
                </div>

                {/* List */}
                <div className="w-full flex flex-col gap-4">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-20">
                            <div className="w-8 h-8 border-2 border-[#8B8DFF] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white/40 text-sm animate-pulse">Summoning legends...</p>
                        </div>
                    ) : (
                        <>
                            {users.length > 0 ? (
                                users.map((user, index) => {
                                    // Rank Styling for 1, 2, 3
                                    let rankStyle = "bg-[#1c1e30]/40 border-white/5 text-white/50";
                                    let rankIcon = null;

                                    if (index === 0) {
                                        rankStyle = "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30 text-yellow-400";
                                        rankIcon = "👑";
                                    } else if (index === 1) {
                                        rankStyle = "bg-gradient-to-r from-gray-400/10 to-transparent border-gray-400/30 text-gray-300";
                                        rankIcon = "🥈";
                                    } else if (index === 2) {
                                        rankStyle = "bg-gradient-to-r from-orange-700/10 to-transparent border-orange-700/30 text-orange-400";
                                        rankIcon = "🥉";
                                    }

                                    return (
                                        <Link
                                            key={user.id}
                                            href={`/${user.username}`}
                                            className={`relative group w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:bg-white/5 hover:border-white/20 ${index === 0 ? 'shadow-[0_0_30px_rgba(234,179,8,0.1)]' : ''} ${index < 3 ? 'border-l-4' : 'border-l border-white/5'}`}
                                            style={{ borderLeftColor: index === 0 ? '#EAB308' : index === 1 ? '#9CA3AF' : index === 2 ? '#C2410C' : '' }}
                                        >
                                            {/* Rank Number */}
                                            <div className={`w-12 h-12 flex items-center justify-center text-xl font-bold font-jersey shrink-0 rounded-xl ${rankStyle}`}>
                                                {rankIcon || `#${index + 1}`}
                                            </div>

                                            {/* Avatar */}
                                            <div className="relative w-12 h-12 shrink-0">
                                                <div className={`w-full h-full rounded-xl overflow-hidden border ${user.rankData.special ? 'border-[#00F5FF]/50 shadow-[0_0_10px_rgba(0,245,255,0.3)] animate-glow-pulse' : 'border-white/10'}`}>
                                                    <img
                                                        src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                                                        alt={user.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            {/* User Details */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-bold truncate flex items-center gap-2">
                                                        {user.username}
                                                        {user.rankData.special && <span className="text-[10px] text-[#00F5FF] animate-pulse">👑</span>}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded border ${user.rankData.bg} ${user.rankData.border} ${user.rankData.shadow} ${user.rankData.special ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] via-[#D946EF] to-[#00F5FF] animate-gradient-x font-bold' : ''}`}
                                                        style={{ color: user.rankData.special ? undefined : user.rankData.color }}
                                                    >
                                                        {user.rankData.name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stat */}
                                            <div className="text-right shrink-0">
                                                <div className="text-2xl font-jersey font-bold text-white tracking-wide">
                                                    {activeTab === 'aura' ? (user.aura || 0) : user.completedCount}
                                                </div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                                                    {activeTab === 'aura' ? 'AURA' : 'GAMES'}
                                                </div>
                                            </div>

                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="w-full text-center py-20 text-white/20">
                                    No legends found yet.
                                </div>
                            )}

                            {/* Owner Section */}
                            {owner && (
                                <div className="mt-12 w-full">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent"></div>
                                        <h2 className="text-[#A855F7] font-jersey text-lg md:text-xl tracking-widest uppercase animate-pulse">Architect of the Realm</h2>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent"></div>
                                    </div>

                                    <Link
                                        href={`/${owner.username}`}
                                        className="relative group w-full flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-2xl border border-[#A855F7]/30 bg-[#A855F7]/5 transition-all duration-300 hover:bg-[#A855F7]/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-in slide-in-from-bottom-4 fade-in duration-700"
                                    >
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A855F7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        {/* Special Rank Icon */}
                                        <div className="hidden md:flex w-16 h-16 items-center justify-center text-3xl font-bold font-jersey shrink-0 rounded-xl bg-gradient-to-br from-[#A855F7]/20 to-[#6366F1]/20 border border-[#A855F7]/30 text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                            ♾️
                                        </div>
                                        {/* Mobile Rank Icon (Smaller) */}
                                        <div className="md:hidden w-12 h-12 flex items-center justify-center text-xl font-bold font-jersey shrink-0 rounded-xl bg-gradient-to-br from-[#A855F7]/20 to-[#6366F1]/20 border border-[#A855F7]/30 text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                            ♾️
                                        </div>

                                        {/* Avatar */}
                                        <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
                                            <div className="w-full h-full rounded-xl overflow-hidden border-2 border-[#A855F7]/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-glow-pulse">
                                                <img
                                                    src={owner.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                                                    alt={owner.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* User Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center z-10">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white text-lg md:text-xl font-bold truncate flex items-center gap-2">
                                                    {owner.username}
                                                    <span className="text-xs md:text-sm text-[#A855F7] animate-pulse">👑</span>
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className="text-[9px] md:text-[10px] px-2 md:px-3 py-0.5 rounded border border-[#A855F7]/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-clip-text text-transparent bg-gradient-to-r from-[#A855F7] via-[#D8B4FE] to-[#A855F7] animate-gradient-x font-bold tracking-wider"
                                                >
                                                    ARCHITECT OF REALMS
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stat */}
                                        <div className="text-right shrink-0 z-10">
                                            <div className="text-2xl md:text-3xl font-jersey font-bold text-[#A855F7] tracking-wide drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                                {activeTab === 'aura' ? (owner.aura || '∞') : (owner.completedCount || '∞')}
                                            </div>
                                            <div className="text-[9px] md:text-[10px] text-[#A855F7]/60 uppercase tracking-widest font-medium">
                                                {activeTab === 'aura' ? 'AURA' : 'GAMES'}
                                            </div>
                                        </div>

                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </main>
        </div >
    );
}
