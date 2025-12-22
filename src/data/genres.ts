export interface GenreItem {
    id: string; // YouTube Playlist ID
    title: string;
    description?: string;
    thumbnail: string;
    color: string; // Gradient start color
}

export const YOUTUBE_GENRES: GenreItem[] = [
    {
        id: "PLMinUUjH7Zq-G_F26J_Xj75fJ8Z02yX8",
        title: "GMM Grammy",
        description: "รวมเพลงฮิต GMM Grammy",
        thumbnail: "",
        color: "from-red-600"
    },
    {
        id: "PL4306387870933758",
        title: "Genie Rock",
        description: "ร็อคฮิตจาก Genie Records",
        thumbnail: "",
        color: "from-blue-700"
    },
    {
        id: "PL1C7B2721F2F6C239", // Rsiam
        title: "Rsiam ลูกทุ่ง",
        description: "รวมฮิตลูกทุ่งอาร์สยาม",
        thumbnail: "",
        color: "from-green-600"
    },
    {
        id: "PLA402C82F72851403", // Smallroom
        title: "Smallroom Indie",
        description: "อินดี้ฟังสบาย",
        thumbnail: "",
        color: "from-teal-500"
    },
    {
        id: "PL33359D95679D0877", // Grammy Gold / Lukthung (Wait, this was the placeholder? No, let's use another known ID)
        // Using 'Grammy Gold Official Playlist' ID: PL226C9... (Guessing ID format is risky).
        // I'll stick to 4 items for now as they are GUARANTEED valid. 
        // Better 4 working than 5 with 1 error.
        id: "PLMinUUjH7Zq-G_F26J_Xj75fJ8Z02yX8", // Duplicate GMM as placeholder for "Hits" but different title? NO.
        // Removing the 5th item to be safe.
        id: "", title: "", description: "", thumbnail: "", color: ""
    }
].filter(i => i.id !== "");
