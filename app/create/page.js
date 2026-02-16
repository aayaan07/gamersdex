"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

// --- Icons ---
const SearchIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const SaveIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
);

// --- Game Card Component ---
const GameCard = ({ game, category, onRemove }) => (
    <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-white/5 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10">
        <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <span className="text-white font-poppins text-sm font-medium line-clamp-2">
                {game.name}
            </span>
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(category, game.id); }}
                className="mt-2 text-xs text-red-400 hover:text-red-300 w-fit"
            >
                Remove
            </button>
        </div>
    </div>
);

export default function CreateProfile() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [steamError, setSteamError] = useState("");

    const [games, setGames] = useState({
        playing: [],
        completed: [],
        dropped: [],
        wishlist: [],
    });

    // Profile State
    const [profileData, setProfileData] = useState({
        username: "",
        bio: "",
        discordId: "",
        steamId: "",
        avatarUrl: "",
        favoriteGame: null,
    });

    // 1. Redirect if not logged in or if already has profile
    // 1. Populate data if editing, or redirect if not logged in
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/");
            } else if (userData?.username) {
                // Pre-fill for editing
                setProfileData({
                    username: userData.username,
                    bio: userData.bio || "",
                    discordId: userData.discordId || "",
                    steamId: userData.steamId || "",
                    avatarUrl: userData.photoURL || user.photoURL || "",
                    favoriteGame: userData.favoriteGame || null,
                });
            } else {
                // New profile: Pre-fill avatar from Google Auth
                setProfileData(prev => ({
                    ...prev,
                    avatarUrl: user.photoURL || ""
                }));
            }

            // Pre-fill games
            if (userData?.games) {
                const newGames = {
                    playing: [],
                    completed: [],
                    dropped: [],
                    wishlist: [],
                };
                userData.games.forEach(g => {
                    if (newGames[g.status]) {
                        newGames[g.status].push(g);
                    }
                });
                setGames(newGames);
            }
        }
    }, [user, userData, authLoading, router]);


    // 2. Check Username Uniqueness
    useEffect(() => {
        const checkUsername = async () => {
            if (profileData.username.length < 3) return;

            // 0. Similarity Check (Bypass all checks if it's the current user's own username)
            if (userData?.username === profileData.username) {
                setUsernameError("");
                return;
            }

            // 1. Length Check
            if (profileData.username.length > 12) {
                setUsernameError("Username must be max 12 characters.");
                return;
            }

            // 2. Format Check (Lowercase, numbers, hyphens)
            const usernameRegex = /^[a-z0-9-]+$/;
            if (!usernameRegex.test(profileData.username)) {
                setUsernameError("Username must be lowercase, numbers, and hyphens only.");
                return;
            }

            // 3. Restricted Words Check
            if (profileData.username.toLowerCase().includes("blazeonix")) {
                setUsernameError("Username cannot contain 'blazeonix'.");
                return;
            }

            // 4. Basic NSFW Filter
            const nsfwWords = ["admin", "mod", "fuck", "shit", "bitch", "cunt", "nigger", "faggot", "dick", "pussy", "asshole"];
            if (nsfwWords.some(word => profileData.username.toLowerCase().includes(word))) {
                setUsernameError("Username contains restricted words.");
                return;
            }

            const q = query(collection(db, "users"), where("username", "==", profileData.username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setUsernameError("Username is already taken.");
            } else {
                setUsernameError("");
            }
        };

        const delayDebounceFn = setTimeout(() => {
            if (profileData.username) {
                checkUsername();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [profileData.username]);

    // Game Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Favorite Game Search State
    const [favGameQuery, setFavGameQuery] = useState("");
    const [favGameResults, setFavGameResults] = useState([]);
    const [isSearchingFav, setIsSearchingFav] = useState(false);



    // Helper: Fetch games from RAWG
    const fetchGames = async (query) => {
        if (!query) return [];
        const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
        const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${query}&page_size=5`);
        const data = await res.json();
        return data.results || [];
    };

    // Helper: Fetch games from RAWG (Legacy wrapper for Library search to maintain API)
    const searchGames = async (query) => {
        if (!query) return;
        setIsSearching(true);
        try {
            const results = await fetchGames(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Failed to fetch games:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2) {
                searchGames(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Debounce search for Favorite Game
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (favGameQuery.length > 2) {
                setIsSearchingFav(true);
                try {
                    const results = await fetchGames(favGameQuery);
                    setFavGameResults(results);
                } catch (error) {
                    console.error("Failed to fetch games:", error);
                } finally {
                    setIsSearchingFav(false);
                }
            } else {
                setFavGameResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [favGameQuery]);

    const handleAddGame = (category, game) => {
        setGames(prev => {
            // Avoid duplicates in the same category
            if (prev[category].some(g => g.id === game.id)) return prev;
            return {
                ...prev,
                [category]: [...prev[category], game]
            };
        });
        setSearchQuery(""); // Clear search after adding
        setSearchResults([]);
    };

    const handleRemoveGame = (category, gameId) => {
        setGames(prev => ({
            ...prev,
            [category]: prev[category].filter(g => g.id !== gameId)
        }));
    };

    const validateSteamUrl = (url) => {
        if (!url) return true; // Empty is allowed
        const steamRegex = /^https:\/\/steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+\/?$/;
        return steamRegex.test(url);
    };

    // Validate Steam URL on change
    useEffect(() => {
        if (profileData.steamId && !validateSteamUrl(profileData.steamId)) {
            setSteamError("Must be a valid Steam profile link (steamcommunity.com/id/ or /profiles/)");
        } else {
            setSteamError("");
        }
    }, [profileData.steamId]);

    const handleSave = async () => {
        if (usernameError || !profileData.username) {
            alert("Please fix username errors.");
            return;
        }

        if (steamError) {
            alert("Please fix Steam Link errors.");
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            const uid = user.uid;

            // Helper to format game data
            const formatGame = (game, status) => ({
                id: game.id,
                name: game.name,
                background_image: game.background_image,
                slug: game.slug,
                released: game.released,
                status: status,
                addedAt: Date.now()
            });

            // Format games array for Firestore
            const formattedGames = [
                ...games.playing.map(g => formatGame(g, 'playing')),
                ...games.completed.map(g => formatGame(g, 'completed')),
                ...games.dropped.map(g => formatGame(g, 'dropped')),
                ...games.wishlist.map(g => formatGame(g, 'wishlist')),
            ];

            const userDoc = {
                uid: uid,
                email: user.email,
                username: profileData.username,
                displayName: user.displayName || profileData.username,
                photoURL: profileData.avatarUrl || user.photoURL,
                bio: profileData.bio,
                discordId: profileData.discordId,
                steamId: profileData.steamId,
                favoriteGame: profileData.favoriteGame,
                games: formattedGames,
                // Preserve existing fields if editing
                joinedAt: userData?.joinedAt || serverTimestamp(),
                rank: userData?.rank || "Novice",
                aura: userData?.aura || 0,
            };

            await setDoc(doc(db, "users", uid), userDoc);
            alert("Profile Created Successfully!");
            router.push(`/${profileData.username}`);
        } catch (error) {
            console.error("Error creating profile:", error);
            alert("Failed to create profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="w-full min-h-screen pt-24 pb-10 px-4 flex flex-col items-center">
                {/* Save Button (Fixed Top Right) */}


                {/* Progress Indicator */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 h-fit w-full max-w-4xl mb-5">
                    <div className="w-fit flex items-center justify-center gap-4 order-2 sm:order-1">
                        <div className={`flex items-center gap-2 ${step === 1 ? 'text-white' : 'text-white/40'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 1 ? 'bg-white/10 border-[#8B8DFF] text-[#8B8DFF]' : 'border-white/20'}`}>1</div>
                            <span className="font-poppins font-medium">Profile</span>
                        </div>
                        <div className="w-16 h-[1px] bg-white/10" />
                        <div className={`flex items-center gap-2 ${step === 2 ? 'text-white' : 'text-white/40'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 2 ? 'bg-white/10 border-[#8B8DFF] text-[#8B8DFF]' : 'border-white/20'}`}>2</div>
                            <span className="font-poppins font-medium">Games</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="btn-primary flex w-full sm:w-fit justify-center order-1 sm:order-2"
                    >
                        Save
                    </button>
                </div>

                <div className="w-full max-w-4xl bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-10 relative">

                    {/* Step 1: Profile Details */}
                    {step === 1 && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="font-almendra text-3xl text-white">{userData?.username ? "Edit Your Profile" : "Create Your Profile"}</h2>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Column: Avatar */}
                                <div className="flex flex-col gap-4 items-center">
                                    <div className="w-40 h-40 rounded-full border-2 border-white/20 overflow-hidden bg-black/40 relative group">
                                        {profileData.avatarUrl ? (
                                            <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <span className="text-4xl">+</span>
                                            </div>
                                        )}
                                        {/* Overlay Helper */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                            <span className="text-xs text-white">Preview</span>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Paste Avatar Image URL"
                                        value={profileData.avatarUrl}
                                        onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                                        className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white/70 focus:outline-none focus:border-[#8B8DFF]/50"
                                    />
                                </div>

                                {/* Right Column: Inputs */}
                                <div className="flex-1 flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-white/60 font-poppins">Username</label>
                                        <input
                                            type="text"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#8B8DFF]/50 transition-colors"
                                            placeholder="e.g. BlazeOnix"
                                        />
                                        {usernameError && <span className="text-red-400 text-xs mt-1">{usernameError}</span>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-white/60 font-poppins">Bio</label>
                                        <textarea
                                            rows="3"
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            maxLength={200}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#8B8DFF]/50 transition-colors resize-none"
                                            placeholder="Tell us about your gaming journey... (Max 200 chars)"
                                        />
                                        <div className="flex justify-end">
                                            <span className={`text-[10px] ${profileData.bio.length >= 200 ? 'text-red-400' : 'text-white/40'}`}>
                                                {profileData.bio.length}/200
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white/60 font-poppins">Discord ID</label>
                                            <input
                                                type="text"
                                                value={profileData.discordId}
                                                onChange={(e) => setProfileData({ ...profileData, discordId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#8B8DFF]/50 transition-colors"
                                                placeholder="User#1234"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white/60 font-poppins">Steam ID</label>
                                            <input
                                                type="text"
                                                value={profileData.steamId}
                                                onChange={(e) => setProfileData({ ...profileData, steamId: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#8B8DFF]/50 transition-colors"
                                                placeholder="Steam Profile URL"
                                            />
                                            {steamError && <span className="text-red-400 text-[10px] mt-1 break-words leading-tight">{steamError}</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-sm text-white/60 font-poppins">Favorite Game (Top Pick)</label>

                                        {profileData.favoriteGame ? (
                                            <div className="w-full bg-white/10 border border-[#8B8DFF]/50 rounded-xl p-2 pl-3 flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={profileData.favoriteGame.background_image}
                                                        alt={profileData.favoriteGame.name}
                                                        className="w-10 h-10 rounded-md object-cover"
                                                    />
                                                    <span className="text-white font-medium text-sm">{profileData.favoriteGame.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setProfileData({ ...profileData, favoriteGame: null });
                                                        setFavGameQuery("");
                                                    }}
                                                    className="p-2 hover:text-red-400 text-white/40 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={favGameQuery}
                                                    onChange={(e) => setFavGameQuery(e.target.value)}
                                                    placeholder="Search your #1 game..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#8B8DFF]/50 transition-colors"
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                                    <SearchIcon />
                                                </div>
                                                {isSearchingFav && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <LoadingSpinner />
                                                    </div>
                                                )}

                                                {/* Favorite Game Search Results */}
                                                {favGameResults.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1f3a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-[20]">
                                                        {favGameResults.map((game) => (
                                                            <div
                                                                key={game.id}
                                                                onClick={() => {
                                                                    setProfileData({ ...profileData, favoriteGame: game });
                                                                    setFavGameResults([]);
                                                                    setFavGameQuery("");
                                                                }}
                                                                className="flex items-center gap-3 p-2 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                                                            >
                                                                <img src={game.background_image} alt={game.name} className="w-8 h-10 object-cover rounded" />
                                                                <div className="flex-1">
                                                                    <h4 className="text-white font-medium text-xs">{game.name}</h4>
                                                                    <span className="text-white/40 text-[10px]">{game.released?.split('-')[0]}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="btn-sec"
                                        >
                                            Next Step
                                            <span className="text-lg">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Game Library */}
                    {step === 2 && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    ← Back to Profile
                                </button>
                                <h2 className="font-almendra text-3xl text-white">Your Game Library</h2>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-full z-50">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search games to add (e.g. Elden Ring, GTA V)..."
                                        className="w-full pl-12 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#8B8DFF]/50 transition-colors placeholder:text-white/30"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <LoadingSpinner />
                                        </div>
                                    )}
                                </div>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1f3a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-[100]">
                                        {searchResults.map((game) => (
                                            <div
                                                key={game.id}
                                                className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                                            >
                                                {game.background_image ? (
                                                    <img src={game.background_image} alt={game.name} className="w-12 h-16 object-cover rounded-md" />
                                                ) : (
                                                    <div className="w-12 h-16 bg-white/10 rounded-md flex items-center justify-center text-xs text-white/30">N/A</div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="text-white font-medium text-sm">{game.name}</h4>
                                                    <span className="text-white/40 text-xs">{game.released?.split('-')[0]}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleAddGame('playing', game)} className="text-[10px] sm:text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-500/40 transition">Playing</button>
                                                    <button onClick={() => handleAddGame('completed', game)} className="text-[10px] sm:text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded hover:bg-green-500/40 transition">Completed</button>
                                                    <button onClick={() => handleAddGame('wishlist', game)} className="text-[10px] sm:text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-500/40 transition">Wishlist</button>
                                                    <button onClick={() => handleAddGame('dropped', game)} className="text-[10px] sm:text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500/40 transition">Dropped</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Currently Playing */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-poppins font-medium text-lg text-blue-300 flex items-center gap-2">
                                        Currently Playing <span className="text-white/20 text-sm">({games.playing.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[120px] bg-white/[0.02] rounded-xl p-3 border border-white/5 border-dashed">
                                        {games.playing.length === 0 && <span className="col-span-full text-white/20 text-sm m-auto text-center">No games added</span>}
                                        {games.playing.map(game => (
                                            <GameCard key={game.id} game={game} category="playing" onRemove={handleRemoveGame} />
                                        ))}
                                    </div>
                                </div>

                                {/* Completed */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-poppins font-medium text-lg text-green-300 flex items-center gap-2">
                                        Completed <span className="text-white/20 text-sm">({games.completed.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[120px] bg-white/[0.02] rounded-xl p-3 border border-white/5 border-dashed">
                                        {games.completed.length === 0 && <span className="col-span-full text-white/20 text-sm m-auto text-center">No games added</span>}
                                        {games.completed.map(game => (
                                            <GameCard key={game.id} game={game} category="completed" onRemove={handleRemoveGame} />
                                        ))}
                                    </div>
                                </div>

                                {/* Wishlist */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-poppins font-medium text-lg text-purple-300 flex items-center gap-2">
                                        Wishlist <span className="text-white/20 text-sm">({games.wishlist.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[120px] bg-white/[0.02] rounded-xl p-3 border border-white/5 border-dashed">
                                        {games.wishlist.length === 0 && <span className="col-span-full text-white/20 text-sm m-auto text-center">No games added</span>}
                                        {games.wishlist.map(game => (
                                            <GameCard key={game.id} game={game} category="wishlist" onRemove={handleRemoveGame} />
                                        ))}
                                    </div>
                                </div>

                                {/* Dropped */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-poppins font-medium text-lg text-red-300 flex items-center gap-2">
                                        Dropped <span className="text-white/20 text-sm">({games.dropped.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[120px] bg-white/[0.02] rounded-xl p-3 border border-white/5 border-dashed">
                                        {games.dropped.length === 0 && <span className="col-span-full text-white/20 text-sm m-auto text-center">No games added</span>}
                                        {games.dropped.map(game => (
                                            <GameCard key={game.id} game={game} category="dropped" onRemove={handleRemoveGame} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            </main>
        </>
    );
}
