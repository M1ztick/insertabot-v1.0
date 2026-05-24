#!/usr/bin/env node

/**
 * SAIGE Sutta Lookup Tool
 * 
 * Search the Pali Canon by topic or keyword to find relevant suttas
 * for AI ethics annotation.
 * 
 * Usage:
 *   node sutta-lookup.js <query> [--collection MN] [--limit 10]
 * 
 * Example:
 *   node sutta-lookup.js "right speech"
 *   node sutta-lookup.js "mindfulness" --collection SN --limit 5
 */

const BASE_URL = process.env.SAIGE_API_URL || "http://localhost:8787";

async function lookup(query, options = {}) {
  const params = new URLSearchParams();
  params.append("q", query);
  if (options.collection) params.append("collection", options.collection);
  if (options.limit) params.append("limit", options.limit);

  const url = `${BASE_URL}/saige/sutta-lookup?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

function printResults(results) {
  if (!results || results.length === 0) {
    console.log("No suttas found matching your query.");
    return;
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`Found ${results.length} suttas:\n`);

  results.forEach((sutta, index) => {
    console.log(`${index + 1}. ${sutta.title}`);
    console.log(`   Collection: ${sutta.collectionName} (${sutta.collection})`);
    console.log(`   SuttaCentral: ${sutta.sourceUrl}`);
    console.log(`   Access to Insight: ${sutta.atiUrl || "N/A"}`);
    console.log(`   Suggested Tags: ${sutta.suggestedThemeTags.join(", ")}`);
    console.log();
  });

  console.log(`${"=".repeat(70)}`);
  console.log("\nUse these to generate a SAIGE record:");
  console.log(`  node generate-record.js "MN 58" "Speech should be True, Beneficial, and Timely"`);
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: node sutta-lookup.js <query> [--collection MN] [--limit 10]");
    console.log("\nExample:");
    console.log('  node sutta-lookup.js "right speech"');
    console.log('  node sutta-lookup.js mind --collection SN --limit 5');
    process.exit(0);
  }

  const query = args[0];
  const options = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--collection" && args[i + 1]) {
      options.collection = args[i + 1].toUpperCase();
      i++;
    }
    if (args[i] === "--limit" && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    }
  }

  return { query, options };
}

async function main() {
  const { query, options } = parseArgs();
  console.log(`Searching for: "${query}"...`);
  
  const results = await lookup(query, options);
  printResults(results);
}

main();