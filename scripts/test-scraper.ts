
// Run with: npx ts-node scripts/test-scraper.ts

import { scrapeMusicExplore, scrapeYouTubePlaylistSearch } from '../src/utils/youtubeScraper';

async function test() {
    console.log("Testing scrapeMusicExplore...");
    try {
        const sections = await scrapeMusicExplore();
        console.log("Explore Sections found:", sections.length);
        sections.forEach(s => {
            console.log(`- ${s.title}: ${s.items.length} items`);
            if (s.items.length > 0) {
                console.log(`  Sample: ${s.items[0].title} (${s.items[0].playlistId})`);
            }
        });
    } catch (e: any) {
        console.error("scrapeMusicExplore Failed:", e.message);
    }

    console.log("\nTesting scrapeYouTubePlaylistSearch ('Thai Top 100')...");
    try {
        const results = await scrapeYouTubePlaylistSearch("Thai Top 100");
        console.log("Search Results found:", results.length);
        results.slice(0, 3).forEach(r => {
            console.log(`- ${r.title} (${r.playlistId})`);
        });
    } catch (e: any) {
        console.error("scrapeYouTubePlaylistSearch Failed:", e.message);
    }
}

test();
