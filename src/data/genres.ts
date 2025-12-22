export interface GenreItem {
    query: string; // Dynamic Search Query
    title: string;
    description?: string;
    thumbnail: string;
    color: string;
}

// Dynamic Search Queries (Always Fresh)
export const YOUTUBE_GENRES: GenreItem[] = [
    {
        query: "เพลงฮิต GMM Grammy ล่าสุด 2025",
        title: "GMM Grammy",
        description: "เพลงฮิตแกรมมี่ อัปเดตล่าสุด",
        thumbnail: "",
        color: "from-red-600"
    },
    {
        query: "เพลงไทยยอดนิยม 2025 Top 100",
        title: "Thailand Top 100",
        description: "เพลงไทยชาร์ตท็อป ยอดวิวสูง",
        thumbnail: "",
        color: "from-blue-600"
    },
    {
        query: "เพลงลูกทุ่งฮิต 100 ล้านวิว ล่าสุด",
        title: "ลูกทุ่ง 100 ล้านวิว",
        description: "รวมฮิตลูกทุ่ง ยอดวิวถล่มทลาย",
        thumbnail: "",
        color: "from-green-600"
    },
    {
        query: "เพลงแดนซ์ มันๆ 2025 ตื๊ดๆ",
        title: "สายปาร์ตี้ (Party)",
        description: "แดนซ์มันส์ๆ เพลงผับ",
        thumbnail: "",
        color: "from-purple-600"
    },
    {
        query: "เพลงอินดี้ฟังสบาย ร้านกาแฟ 2025",
        title: "Indie & Cafe",
        description: "เพลงฟังสบายๆ ชิลล์ๆ",
        thumbnail: "",
        color: "from-teal-500"
    },
    {
        query: "เพลงเศร้า อกหัก 2025",
        title: "เพลงเศร้า (Sad)",
        description: "เอาใจคนอกหัก",
        thumbnail: "",
        color: "from-gray-500"
    },
    {
        query: "เพลงยุค 90 ไทย ฮิต",
        title: "90's Hits",
        description: "เพลงฮิตยุค 90-2000",
        thumbnail: "",
        color: "from-yellow-500"
    },
    {
        query: "เพลงเพื่อชีวิต ฮิตตลอดกาล",
        title: "เพื่อชีวิต",
        description: "ตำนานเพลงเพื่อชีวิต",
        thumbnail: "",
        color: "from-orange-700"
    }
];
