/**
 * SAIGE (Sutta-based AI Governance & Ethics) Toolkit
 * 
 * Tools for curating high-quality AI alignment training data from
 * Buddhist canonical sources (Pali Canon).
 */

// Well-known sutta collections and their abbreviations
export const CANONICAL_COLLECTIONS = {
  DN: { name: "Dīgha Nikāya", type: "nikaya", language: "Pali" },
  MN: { name: "Majjhima Nikāya", type: "nikaya", language: "Pali" },
  SN: { name: "Saṃyutta Nikāya", type: "nikaya", language: "Pali" },
  AN: { name: "Aṅguttara Nikāya", type: "nikaya", language: "Pali" },
  KN: { name: "Khuddaka Nikāya", type: "nikaya", language: "Pali" },
  Dhp: { name: "Dhammapada", type: "kn", language: "Pali" },
  Ud: { name: "Udāna", type: "kn", language: "Pali" },
  Iti: { name: "Itivuttaka", type: "kn", language: "Pali" },
  Snp: { name: "Sutta Nipāta", type: "kn", language: "Pali" },
  Thag: { name: "Theragāthā", type: "kn", language: "Pali" },
  Thig: { name: "Therīgāthā", type: "kn", language: "Pali" },
};

// Eightfold Path factors for thematic organization
export const PATH_FACTORS = [
  "right_view",
  "right_intention",
  "right_speech",
  "right_action",
  "right_livelihood",
  "right_effort",
  "right_mindfulness",
  "right_concentration",
];

// Theme tags for granular categorization
export const COMMON_THEME_TAGS = [
  "truthfulness",
  "non-divisiveness",
  "non-harshness",
  "restraint",
  "compassion",
  "benefit",
  "timing",
  "reflection",
  "self-monitoring",
  "non-harm",
  "honesty",
  "kindness",
  "wisdom",
  "patience",
  "forgiveness",
  "mindfulness",
  "meditation",
  "concentration",
  "effort",
  "discernment",
];

// Pali Canonical Tradition sources
export const SOURCE_TRADITIONS = [
  "Pali Canon / Theravada",
  "Mahayana Sutras",
  "Vajrayana Texts",
  "Chinese Āgamas",
];

// Common translators for source attribution
export const COMMON_TRANSLATORS = [
  "Ṭhānissaro Bhikkhu",
  "Bhikkhu Bodhi",
  "Maurice Walshe",
  "I.B. Horner",
  "Sujato Bhikkhu",
];

// SuttaCentral API endpoints
const SUTTACENTRAL_API = "https://suttacentral.net/api";

// Access to Insight base URL for fallback references
const ATI_BASE_URL = "https://www.accesstoinsight.org/tipitaka";

/**
 * Generate the next SAIGE record ID based on existing records
 */
export function generateRecordId(
  pathFactor: string,
  existingIds: string[]
): string {
  const prefix = `saige-${pathFactor.substring(0, 2)}`;
  const maxNum = existingIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => {
      const match = id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .reduce((max, num) => Math.max(max, num), 0);
  
  return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
}

/**
 * Create a pre-filled SAIGE record template
 */
export function createSaigeRecordTemplate(
  canonicalId: string,
  title: string,
  collection: string,
  pathFactor: string,
  sourceUrl: string,
  options: {
    id?: string;
    translator?: string;
    themeTags?: string[];
    sourceTradition?: string;
  } = {}
): Record<string, unknown> {
  const now = new Date().toISOString().split("T")[0];
  
  return {
    id: options.id || `saige-${pathFactor.substring(0, 2)}-XXX`,
    canonical_id: canonicalId,
    title,
    collection,
    path_factor: pathFactor,
    theme_tags: options.themeTags || [],
    source_tradition: options.sourceTradition || "Pali Canon / Theravada",
    source_platform: "Canonical reference",
    source_url: sourceUrl,
    translator: options.translator || "",
    pali_available: false,
    pali_url: null,
    source_excerpt: "",
    source_summary: "",
    core_principle: "",
    interpretive_note: "",
    ai_behavior_mapping: "",
    behavior_targets: [],
    failure_modes: [],
    recommended_response_traits: [],
    unsafe_misreadings: [],
    example_use_cases: [],
    example_prompt_types: [],
    evaluation_questions: [],
    research_notes: "",
    annotation_author: "Mistyk",
    annotation_status: "draft",
    confidence: "high",
    version: "0.1",
    last_updated: now,
  };
}

/**
 * Search SuttaCentral API for suttas by keyword/topic
 */
export async function searchSuttas(
  query: string,
  language: string = "en"
): Promise<Array<{
  uid: string;
  title: string;
  difficulty?: string;
  original_title?: string;
  acronym?: string;
  category?: string;
  authors?: string[];
}>> {
  try {
    // Search SuttaCentral's search endpoint
    const response = await fetch(
      `${SUTTACENTRAL_API}/search?query=${encodeURIComponent(query)}&language=${language}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SuttaCentral API error: ${response.status}`);
    }

    const data = await response.json() as {
      hits?: {
        hits?: Array<{
          _source?: {
            uid?: string;
            name?: string;
            difficulty?: string;
            original_title?: string;
          };
        }>;
      };
    };

    return (data.hits?.hits || [])
      .filter((hit) => hit._source)
      .map((hit) => {
        const source = hit._source!;
        const uid = source.uid || "";
        
        // Parse collection from UID (e.g., "mn58" → "MN")
        const collection = uid.replace(/\d+/, "").toUpperCase();
        
        return {
          uid,
          title: source.name || uid,
          difficulty: source.difficulty,
          original_title: source.original_title,
          category: CANONICAL_COLLECTIONS[collection as keyof typeof CANONICAL_COLLECTIONS]?.name,
        };
      });
  } catch (error) {
    console.error("SuttaCentral search error:", error);
    return [];
  }
}

/**
 * Get detailed sutta information from SuttaCentral
 */
export async function getSuttaDetails(
  uid: string,
  language: string = "en"
): Promise<{
  uid: string;
  title: string;
  content?: string;
  description?: string;
  author?: string;
  next?: { uid: string; title: string };
  previous?: { uid: string; title: string };
} | null> {
  try {
    const response = await fetch(
      `${SUTTACENTRAL_API}/suttas/${uid}?language=${language}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SuttaCentral API error: ${response.status}`);
    }

    const data = await response.json() as {
      uid?: string;
      root_text?: { title?: string; content?: string };
      translation?: { title?: string; text?: string; author?: string };
    };

    return {
      uid: data.uid || uid,
      title: data.translation?.title || data.root_text?.title || uid,
      content: data.translation?.text,
      author: data.translation?.author,
    };
  } catch (error) {
    console.error("SuttaCentral details error:", error);
    return null;
  }
}

/**
 * Get Access to Insight URL for a sutta reference
 */
export function getAccessToInsightUrl(canonicalId: string): string {
  // Convert format: SN 45.8 → sn/sn45/sn45.008.than.html
  const match = canonicalId.match(/^([A-Za-z]+)\s*(\d+)(?:\.(\d+))?$/);
  if (!match) return "";

  const [, collection, major, minor] = match;
  const coll = collection.toLowerCase();
  
  if (minor) {
    // e.g., SN 45.8 → sn/sn45/sn45.008.than.html
    return `${ATI_BASE_URL}/${coll}/${coll}${major}/${coll}${major}.${String(minor).padStart(3, "0")}.than.html`;
  } else {
    // e.g., DN 1 → dn/dn.01.0.than.html
    return `${ATI_BASE_URL}/${coll}/${coll}.${String(major).padStart(2, "0")}.0.than.html`;
  }
}

/**
 * Build a sutta lookup response with available sources
 */
export async function buildSuttaLookup(
  query: string
): Promise<Array<{
  uid: string;
  title: string;
  collection: string;
  collectionName: string;
  sourceUrl: string;
  atiUrl: string;
  availableTranslations: string[];
  suggestedThemeTags: string[];
}>> {
  const results = await searchSuttas(query);
  
  return results.map((sutta) => {
    const coll = sutta.uid.replace(/\d+/, "").toUpperCase();
    const collectionInfo = CANONICAL_COLLECTIONS[coll as keyof typeof CANONICAL_COLLECTIONS];
    
    // Parse canonical ID format
    const numMatch = sutta.uid.match(/\d+/);
    const num = numMatch ? numMatch[0] : "";
    const canonicalId = num.includes(".") 
      ? `${coll} ${num}` 
      : `${coll} ${parseInt(num)}`;
    
    return {
      uid: sutta.uid,
      title: sutta.title,
      collection: coll,
      collectionName: collectionInfo?.name || coll,
      sourceUrl: `https://suttacentral.net/${sutta.uid}`,
      atiUrl: getAccessToInsightUrl(canonicalId),
      availableTranslations: ["en"],
      suggestedThemeTags: getSuggestedTagsForCollection(coll),
    };
  });
}

/**
 * Get recommended theme tags based on collection
 */
function getSuggestedTagsForCollection(collection: string): string[] {
  const tagMap: Record<string, string[]> = {
    DN: ["wisdom", "discernment", "meditation", "concentration"],
    MN: ["meditation", "mindfulness", "wisdom", "discernment", "effort"],
    SN: ["mindfulness", "concentration", "wisdom", "discernment"],
    AN: ["effort", "mindfulness", "wisdom", "kindness", "patience"],
    Dhp: ["wisdom", "mindfulness", "effort", "patience", "kindness"],
    Ud: ["renunciation", "wisdom", "awakening"],
    Iti: ["mindfulness", "wisdom", "effort"],
    Snp: ["renunciation", "wisdom", "peace", "contentment"],
  };
  
  return tagMap[collection] || ["wisdom", "mindfulness"];
}

/**
 * Validate a SAIGE record against the schema
 */
export function validateSaigeRecord(record: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const requiredFields = [
    "id",
    "canonical_id",
    "title",
    "collection",
    "path_factor",
    "theme_tags",
    "source_tradition",
    "source_platform",
    "source_url",
    "transformer",
  ];

  for (const field of requiredFields) {
    if (!(field in record) || record[field] === "" || record[field] === null) {
      errors.push(`Missing or empty required field: ${field}`);
    }
  }

  // Validate path_factor is in the enum
  if (record.path_factor && !PATH_FACTORS.includes(record.path_factor as string)) {
    errors.push(`Invalid path_factor: ${record.path_factor}. Must be one of: ${PATH_FACTORS.join(", ")}`);
  }

  // Validate collection abbreviation
  const validCollections = Object.keys(CANONICAL_COLLECTIONS);
  if (record.collection && !validCollections.includes(record.collection as string)) {
    errors.push(`Unknown collection: ${record.collection}`);
  }

  // Validate theme_tags is an array
  if (record.theme_tags && !Array.isArray(record.theme_tags)) {
    errors.push("theme_tags must be an array");
  }

  // Validate confidence is one of allowed values
  const validConfidence = ["high", "medium", "low"];
  if (record.confidence && !validConfidence.includes(record.confidence as string)) {
    errors.push(`Invalid confidence: ${record.confidence}`);
  }

  // Validate annotation_status
  const validStatus = ["draft", "review", "published", "archived"];
  if (record.annotation_status && !validStatus.includes(record.annotation_status as string)) {
    errors.push(`Invalid annotation_status: ${record.annotation_status}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export all records for path factor to JSON
 */
export function exportRecordsByPathFactor(
  records: Array<Record<string, unknown>>,
  pathFactor: string
): string {
  const filtered = records.filter((r) => r.path_factor === pathFactor);
  return JSON.stringify(filtered, null, 2);
}

/**
 * Get statistics about a SAIGE dataset
 */
export function getDatasetStats(records: Array<Record<string, unknown>>): {
  total: number;
  byPathFactor: Record<string, number>;
  byCollection: Record<string, number>;
  byStatus: Record<string, number>;
  topThemes: Array<{ tag: string; count: number }>;
  coverage: {
    eightfoldPath: number; // percentage (0-100)
    hasInterpretation: number; // count
    hasBehaviorMapping: number; // count
  };
} {
  const byPathFactor: Record<string, number> = {};
  const byCollection: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const themeCounts: Record<string, number> = {};
  
  let hasInterpretation = 0;
  let hasBehaviorMapping = 0;

  for (const record of records) {
    // Count by path factor
    const pf = record.path_factor as string;
    byPathFactor[pf] = (byPathFactor[pf] || 0) + 1;

    // Count by collection
    const coll = record.collection as string;
    byCollection[coll] = (byCollection[coll] || 0) + 1;

    // Count by status
    const status = record.annotation_status as string;
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Count themes
    const themes = record.theme_tags as string[] || [];
    for (const theme of themes) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }

    // Check completeness
    if (record.interpretive_note && (record.interpretive_note as string).length > 50) {
      hasInterpretation++;
    }
    if (record.ai_behavior_mapping && (record.ai_behavior_mapping as string).length > 50) {
      hasBehaviorMapping++;
    }
  }

  // Get top themes
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Calculate eightfold path coverage
  const coveredFactors = Object.keys(byPathFactor).length;
  const eightfoldPathCoverage = Math.round((coveredFactors / 8) * 100);

  return {
    total: records.length,
    byPathFactor,
    byCollection,
    byStatus,
    topThemes,
    coverage: {
      eightfoldPath: eightfoldPathCoverage,
      hasInterpretation,
      hasBehaviorMapping,
    },
  };
}