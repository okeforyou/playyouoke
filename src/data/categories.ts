export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
    query: string; // The search term used to fetch songs
    playlistId?: string; // Optional: if we want to fetch specific YT playlist
}

export const CATEGORIES: Category[] = [
    {
        id: 'thai_hits',
        name: 'ฮิตติดชาร์ต',
        color: 'from-orange-500 to-red-600',
        icon: '🔥',
        query: 'เพลงไทยฮิตล่าสุด 2024'
    },
    {
        id: 'party_dance',
        name: 'สายย่อ/แดนซ์',
        color: 'from-purple-500 to-pink-600',
        icon: '💃',
        query: 'รวมเพลงแดนซ์ สายย่อ มันส์ๆ'
    },
    {
        id: 'thai_country',
        name: 'ลูกทุ่ง/เพื่อชีวิต',
        color: 'from-green-500 to-emerald-700',
        icon: '🌾',
        query: 'รวมเพลงลูกทุ่งฮิต เพื่อชีวิต'
    },
    {
        id: 'kpop',
        name: 'K-Pop Hit',
        color: 'from-rose-400 to-red-500',
        icon: '🇰🇷',
        query: 'K-Pop hits karaoke'
    },
    {
        id: 'inter_hits',
        name: 'Inter Hits',
        color: 'from-blue-500 to-indigo-600',
        icon: '🌍',
        query: 'International karaoke hits 2024'
    },
    {
        id: 'pub_vibes',
        name: 'เพลงร้านเหล้า',
        color: 'from-amber-700 to-yellow-600',
        icon: '🍻',
        query: 'รวมเพลงร้านเหล้า ร้องตามได้'
    },
    {
        id: '90s_thai',
        name: '90s Thai Pop',
        color: 'from-teal-400 to-cyan-600',
        icon: '📼',
        query: 'เพลงไทย 90s คาราโอเกะ'
    },
    {
        id: 'rock',
        name: 'Rock Thai',
        color: 'from-stone-700 to-black',
        icon: '🎸',
        query: 'รวมเพลงร็อคไทย มันส์ๆ'
    }
];
