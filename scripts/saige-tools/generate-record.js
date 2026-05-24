#!/usr/bin/env node

/**
 * SAIGE Record Generator
 * 
 * Generate a pre-filled SAIGE JSON record template for a sutta.
 * 
 * Usage:
 *   node generate-record.js <canonical_id> <title> [options]
 * 
 * Required:
 *   canonical_id    e.g., "MN 58", "SN 45.8"
 *   title           The sutta title
 * 
 * Options:
 *   --path-factor   Eightfold path factor (default: right_speech)
 *   --translator    Translator name
 *   --tags          Comma-separated theme tags
 *   --output        Output file path (default: stdout)
 *   --draft         Mark as draft status (default)
 * 
 * Example:
 *   node generate-record.js "MN 58" "Speech should be True, Beneficial, and Timely" \
 *     --path-factor right_speech \
 *     --translator "Ṭhānissaro Bhikkhu" \
 *     --tags "truthfulness,benefit,timing"
 */

const fs = require("fs");
const path = require("path");
const BASE_URL = process.env.SAIGE_API_URL || "http://localhost:8787";

async function generateRecord(canonicalId, title, options = {}) {
  const params = new URLSearchParams();
  params.append("canonical_id", canonicalId);
  params.append("title", title);
  if (options.pathFactor) params.append("path_factor", options.pathFactor);
  if (options.translator) params.append("translator", options.translator);
  if (options.tags) params.append("tags", options.tags);

  const url = `${BASE_URL}/saige/generate-record?${params.toString()}`;
  
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

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("SAIGE Record Generator");
    console.log("=".repeat(50));
    console.log("\nUsage:");
    console.log("  node generate-record.js <canonical_id> <title> [options]");
    console.log("\nRequired:");
    console.log("  canonical_id    e.g., 'MN 58', 'SN 45.8'");
    console.log("  title           The sutta title");
    console.log("\nOptions:");
    console.log("  --path-factor   Eightfold path factor (default: right_speech)");
    console.log("  --translator    Translator name");
    console.log("  --tags          Comma-separated theme tags");
    console.log("  --output        Output file path");
    console.log("\nExample:");
    console.log('  node generate-record.js "MN 58" "Speech should be True, Beneficial, and Timely" --tags "truthfulness,benefit,timing"');
    process.exit(0);
  }

  const canonicalId = args[0];
  const title = args[1];
  const options = {
    pathFactor: "right_speech",
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--path-factor" && args[i + 1]) {
      options.pathFactor = args[i + 1];
      i++;
    } else if (args[i] === "--translator" && args[i + 1]) {
      options.translator = args[i + 1];
      i++;
    } else if (args[i] === "--tags" && args[i + 1]) {
      options.tags = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    }
  }

  return { canonicalId, title, options };
}

async function main() {
  const { canonicalId, title, options } = parseArgs();
  
  console.log(`Generating SAIGE record for ${canonicalId}...\n`);
  
  const record = await generateRecord(canonicalId, title, options);
  const jsonOutput = JSON.stringify(record, null, 2);

  if (options.output) {
    const outputPath = path.resolve(options.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, jsonOutput);
    console.log(`✓ Record saved to: ${outputPath}`);
    
    // Also print instructions
    console.log("\n" + "=".repeat(50));
    console.log("Next steps:");
    console.log("1. Fill in the empty fields:");
    console.log("   - source_excerpt");
    console.log("   - source_summary");
    console.log("   - core_principle");
    console.log("   - interpretive_note");
    console.log("   - ai_behavior_mapping");
    console.log("2. Validate the record:");
    console.log(`   node validate-record.js ${options.output}`);
    console.log("3. Add to the dataset:");
    console.log(`   cp ${options.output} data/saige/`);
  } else {
    console.log(jsonOutput);
  }
}

main();