export interface GenreItem {
    id: string; // YouTube Playlist ID
    title: string;
    description?: string;
    thumbnail: string;
    color: string; // Gradient start color
}

export const YOUTUBE_GENRES: GenreItem[] = [
    {
        id: "PLMinUUjH7Zq-G_F26J_Xj75fJ8Z02yX8", // GMM Grammy Hits
        title: "เพลงฮิต GMM Grammy",
        description: "รวมเพลงฮิต GMM Grammy ล่าสุด",
        thumbnail: "https://i.ytimg.com/vi/PLMinUUjH7Zq-G_F26J_Xj75fJ8Z02yX8/mqdefault.jpg",
        color: "from-red-500"
    },
    {
        id: "PL33359D95679D0877", // Thai Top 100 (Placeholder ID)
        title: "เพลงไทยยอดนิยม",
        description: "อัปเดตเพลงไทยมาแรง 2025",
        thumbnail: "https://i.ytimg.com/vi/random/mqdefault.jpg",
        color: "from-blue-500"
    },
    {
        id: "PLc7_tWf3ej9_yK3_qK3_fK3_fK3_fK3", // Luk Thung (Placeholder)
        title: "ลูกทุ่งอินดี้",
        description: "รวมฮิตลูกทุ่งอินดี้ ร้อยล้านวิว",
        thumbnail: "https://i.ytimg.com/vi/lukthung/mqdefault.jpg",
        color: "from-green-500"
    },
    {
        id: "PLstart", // Party
        title: "สายปาร์ตี้ (Party)",
        description: "แดนซ์มันส์ๆ เพลงผับ",
        thumbnail: "https://i.ytimg.com/vi/party/mqdefault.jpg",
        color: "from-purple-500"
    },
    {
        id: "PLsad", // Sad
        title: "เพลงเศร้า (Sad)",
        description: "เอาใจคนอกหัก",
        thumbnail: "https://i.ytimg.com/vi/sad/mqdefault.jpg",
        color: "from-gray-500"
    },
    {
        id: "PLold", // 90s
        title: "90's & 2000's",
        description: "เพลงฮิตยุค 90-2000",
        thumbnail: "https://i.ytimg.com/vi/90s/mqdefault.jpg",
        color: "from-yellow-500"
    }
];
