# SAIGE Tools

Command-line utilities for curating the SAIGE (Sutta-based AI Governance & Ethics) dataset.

## Overview

SAIGE bridges 2,500-year-old Buddhist ethical frameworks with modern AI behavior science. These tools help you:

1. **Find source material** - Search the Pali Canon by topic or keyword
2. **Generate records** - Create pre-filled JSON templates for annotation
3. **Validate data** - Ensure records meet the schema requirements

## Setup

```bash
# Install dependencies
cd scripts/saige-tools
npm install

# Set the API URL (optional, defaults to localhost:8787)
export SAIGE_API_URL="https://insertabot.io"
```

## Tools

### 1. Sutta Lookup (`sutta-lookup.js`)

Search for suttas in the Pali Canon by topic or keyword.

```bash
# Basic search
node sutta-lookup.js "right speech"

# Search within a specific collection
node sutta-lookup.js mind --collection SN --limit 5

# Output includes:
# - Sutta title and collection
# - Links to SuttaCentral and Access to Insight
# - Suggested theme tags for categorization
```

### 2. Record Generator (`generate-record.js`)

Create a new SAIGE record template with pre-filled metadata.

```bash
# Basic usage
node generate-record.js "MN 58" "Speech should be True, Beneficial, and Timely"

# With options
node generate-record.js "MN 58" "Speech should be True, Beneficial, and Timely" \
  --path-factor right_speech \
  --translator "Ṭhānissaro Bhikkhu" \
  --tags "truthfulness,benefit,timing" \
  --output data/saige/saige-rs-002.json

# Available path factors:
# - right_view, right_intention, right_speech, right_action
# - right_livelihood, right_effort, right_mindfulness, right_concentration
```

### 3. Record Validator (`validate-record.js`)

Validate a SAIGE record against the schema.

```bash
node validate-record.js data/saige/saige-rs-002.json
```

## Workflow Example

```bash
# 1. Find a relevant sutta
node sutta-lookup.js "truthful speech"

# 2. Generate a record template
node generate-record.js "MN 58" "Speech should be True, Beneficial, and Timely" \
  --path-factor right_speech \
  --output data/saige/saige-rs-new.json

# 3. Edit the file to add your analysis
vim data/saige/saige-rs-new.json

# 4. Validate before committing
node validate-record.js data/saige/saige-rs-new.json

# 5. Add to dataset and commit
git add data/saige/saige-rs-new.json
git commit -m "Add MN 58 record on truthfulness and timing"
git push origin main
```

## SAIGE Record Structure

See the main project documentation for the full schema. Key fields include:

| Field | Description |
|-------|-------------|
| `canonical_id` | Sutta reference (e.g., "MN 58", "SN 45.8") |
| `path_factor` | Which Eightfold Path factor this addresses |
| `theme_tags` | Granular themes (truthfulness, compassion, etc.) |
| `core_principle` | The essential ethical insight |
| `interpretive_note` | How to understand this for AI |
| `ai_behavior_mapping` | Concrete behavior targets for models |
| `evaluation_questions` | Test questions to verify alignment |

## Configuration

Environment variables:

- `SAIGE_API_URL` - Base URL for the SAIGE API endpoints (default: http://localhost:8787)

## Integration with GitHub

These tools work with the automatic CI/CD pipeline:

1. Make changes locally using these tools
2. Push to GitHub
3. GitHub Actions validates the JSON schema
4. If valid, merges and deploys to Cloudflare

## API Endpoints

The insertabot Worker exposes these endpoints:

- `GET /saige/sutta-lookup?q=<query>&collection=<col>&limit=<n>` - Search suttas
- `GET /saige/generate-record` - Generate record template
- `POST /saige/validate` - Validate record JSON
- `GET /saige/stats` - Get dataset statistics
- `GET /saige/export` - Export records by path factor

## License

GNU-v2 - Same as the main insertabot project.