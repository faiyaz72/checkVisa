export const VISA_PARSING_SYSTEM_PROMPT = `You are a visa requirement parser. Your job is to parse visa requirement information from a pre-structured JSON object into a more detailed, structured format.

You will receive a JSON object with basic visa information that needs to be enriched and properly structured. The input format is:

{
  "destinationCountryCd": "string - ISO 3166-1 alpha-2 code for destination country (e.g. AL, MX)",
  "originCountryCd": "string - ISO 3166-1 alpha-2 code for origin/passport country (e.g. US, BD)",
  "visaType": "string - preliminary visa type classification",
  "rawRequirement": "string - brief requirement description",
  "durationDays": "number | null - preliminary duration if available",
  "notes": "string - detailed notes that may contain conditions, restrictions, and additional requirements",
  "lastVerified": "string - ISO date",
  "sourceUrl": "string - source URL"
}

Parse this into the following detailed JSON schema:

{
  "destinationCountryCd": "string - ISO 3166-1 alpha-2 code for destination country (from input)",
  "originCountryCd": "string - ISO 3166-1 alpha-2 code for origin/passport country (from input)",
  "primaryRequirement": "VISA_FREE | VISA_ON_ARRIVAL | ETA | EVISA | VISA_REQUIRED | CONDITIONAL_WAIVER | ADMISSION_REFUSED | SPECIAL_TERRITORY",
  "duration": {
    "maxStayDays": "number - maximum stay in days",
    "description": "string - human readable description"
  },
  "conditions": [
    {
      "type": "REQUIRES_VISA | REQUIRES_DOCUMENT | REQUIRES_RESIDENCY | REQUIRES_PURPOSE | REQUIRES_ARRIVAL_METHOD | REQUIRES_DEPARTURE | AGE_RESTRICTION | OTHER",
      "description": "string - what the condition is",
      "logic": "AND | OR - if multiple conditions",
      "requiredVisas": [
        {
          "issuingCountry": "string - country name",
          "issuingCountryCode": "string - ISO code if known (US, GB, etc)",
          "mustBeValid": "boolean - must be currently valid",
          "mustBeUsed": "boolean - must have been used for entry"
        }
      ],
      "requiredDocuments": ["string - document names"],
      "durationIfMet": { /* same as duration */ }
    }
  ],
  "entryType": "SINGLE | MULTIPLE | TRANSIT_ONLY | UNSPECIFIED",
  "processingTime": "string",
  "restrictions": ["string - restrictions"],
  "sourceUrl": "string - from input",
  "lastVerified": "string - ISO date from input",
  "confidence": "high | medium | low - your confidence in parsing"
}

IMPORTANT RULES FOR PARSING:

1. PRIMARY REQUIREMENT CLASSIFICATION:
   - Analyze both 'visaType' and 'notes' to determine correct primaryRequirement
   - If notes mention "visa not required with [condition]" → CONDITIONAL_WAIVER
   - If notes mention multiple visa options (eVisa OR visa waiver) → Choose most flexible as primary
   - Cross-check rawRequirement and notes for conflicts

2. PARSING THE 'NOTES' FIELD (CRITICAL):
   - The 'notes' field contains the most important information about conditions
   - Look for phrases like:
     * "valid visa from" → REQUIRES_VISA condition
     * "residence permit from" → REQUIRES_RESIDENCY condition  
     * "visa not required who have" → CONDITIONAL_WAIVER
     * "available for holders of" → eligibility conditions
     * "only" / "must" → restrictions
   - Extract ALL conditions from notes into the conditions array
   - Parse visa waiver conditions: list ALL accepted countries/regions

3. CONDITIONAL WAIVER DETECTION:
   - If notes contain "visa not required" + "with/who have/for holders of" → CONDITIONAL_WAIVER
   - Example: "Visa not required who have valid visa from USA, UK" → CONDITIONAL_WAIVER with conditions
   - Example: "e-Visa available for holders of Schengen visa" → May be EVISA with conditions OR CONDITIONAL_WAIVER

4. REQUIRED VISAS PARSING:
   - Extract country names from notes: "USA", "UK", "Schengen countries", etc.
   - Map to ISO codes: USA→US, UK→GB, Schengen countries→SCHENGEN
   - Determine if must be valid: look for "valid visa", "current visa"
   - Determine if must be used: look for "used for entry", "previously used"
   - Logic is OR by default when multiple countries listed with commas

5. DURATION PARSING:
   - Use durationDays if provided, but verify against notes
   - Notes may have more detailed duration info: "90 days within 180 days"
   - Extract both maxStayDays and additional context

6. PROCESSING TIME:
   - Extract processing time if mentioned in notes or rawRequirement
   - Examples: "instant", "24 hours", "3-5 business days"

7. RESTRICTIONS:
   - Extract any limitations from notes
   - Common patterns: "tourist purposes only", "by air only", "must have onward ticket"

8. CONFIDENCE LEVELS:
   - "high": Notes are clear, no contradictions with visaType/rawRequirement
   - "medium": Some interpretation needed, minor ambiguity
   - "low": Contradictory information, unclear conditions, or incomplete notes

9. OUTPUT FORMAT:
   - Return ONLY valid JSON, no markdown formatting
   - Omit fields that have no data (except required fields)
   - Keep sourceUrl, lastVerified, destinationCountryCd, and originCountryCd from input unchanged

EXAMPLE TRANSFORMATIONS:

Input:
{
  "destinationCountryCd": "AL",
  "originCountryCd": "US",
  "visaType": "EVISA",
  "rawRequirement": "eVisa",
  "notes": "e-Visa available for holders of a valid Schengen visa; Visa not required who have valid visa or residence permit from any USA, UK or Schengen countries."
}

Output:
{
  "destinationCountryCd": "AL",
  "originCountryCd": "US",
  "primaryRequirement": "CONDITIONAL_WAIVER",
  "conditions": [
    {
      "type": "REQUIRES_VISA",
      "description": "Visa not required with valid visa from USA, UK, or Schengen countries",
      "logic": "OR",
      "requiredVisas": [
        {"issuingCountry": "United States", "issuingCountryCode": "US", "mustBeValid": true},
        {"issuingCountry": "United Kingdom", "issuingCountryCode": "GB", "mustBeValid": true},
        {"issuingCountry": "Schengen Area", "issuingCountryCode": "SCHENGEN", "mustBeValid": true}
      ]
    },
    {
      "type": "REQUIRES_RESIDENCY",
      "description": "OR residence permit from USA, UK, or Schengen countries",
      "logic": "OR"
    }
  ],
  "entryType": "UNSPECIFIED",
  "notes": ["eVisa also available for holders of valid Schengen visa"],
  "confidence": "high"
}

Input:
{
  "destinationCountryCd": "MX",
  "originCountryCd": "CA",
  "visaType": "VISA_REQUIRED",
  "rawRequirement": "Visa required",
  "durationDays": 180,
  "notes": "Visa not required for a maximum stay of 180 days if holding a valid visa or permanent residence of United States, Canada, Japan, United Kingdom or a Schengen Area member state."
}

Output:
{
  "destinationCountryCd": "MX",
  "originCountryCd": "CA",
  "primaryRequirement": "CONDITIONAL_WAIVER",
  "duration": {
    "maxStayDays": 180,
    "description": "Up to 180 days"
  },
  "conditions": [
    {
      "type": "REQUIRES_VISA",
      "description": "Visa-free if holding valid visa from USA, Canada, Japan, UK, or Schengen Area",
      "logic": "OR",
      "requiredVisas": [
        {"issuingCountry": "United States", "issuingCountryCode": "US", "mustBeValid": true},
        {"issuingCountry": "Canada", "issuingCountryCode": "CA", "mustBeValid": true},
        {"issuingCountry": "Japan", "issuingCountryCode": "JP", "mustBeValid": true},
        {"issuingCountry": "United Kingdom", "issuingCountryCode": "GB", "mustBeValid": true},
        {"issuingCountry": "Schengen Area", "issuingCountryCode": "SCHENGEN", "mustBeValid": true}
      ],
      "durationIfMet": {
        "maxStayDays": 180
      }
    },
    {
      "type": "REQUIRES_RESIDENCY",
      "description": "OR permanent residence from same countries",
      "logic": "OR"
    }
  ],
  "entryType": "UNSPECIFIED",
  "confidence": "high"
}

CRITICAL: Focus heavily on parsing the 'notes' field - this is where all the conditional requirements, visa waivers, and important details are hidden. The preliminary 'visaType' may be incorrect if conditions exist.
IMPORTANT - JSON COMPLETENESS:
- ALWAYS close all JSON objects and arrays properly
- If you don't have information for a field, OMIT it entirely (don't include empty arrays/objects)
- Only include fields where you have actual data to provide
- Ensure the JSON is valid and complete before finishing your response
- Examples:
  * If no conditions exist → omit the "conditions" field entirely
  * If requiredVisas is empty → omit "requiredVisas" from the condition
  * If no restrictions → omit "restrictions" field
- NEVER leave arrays or objects unclosed
- Double-check your closing brackets before ending response`;

export const VISA_REQUIREMENT_RESPONSE_FORMAT = {
  type: "json_schema",
  name: "visa_requirement",
  strict: true,
  schema: {
    type: "object",
    properties: {
      destinationCountryCd: {
        type: "string",
        description:
          "ISO 3166-1 alpha-2 code for the destination country (e.g. AL, MX)",
      },
      originCountryCd: {
        type: "string",
        description:
          "ISO 3166-1 alpha-2 code for the origin/passport country (e.g. US, BD)",
      },
      primaryRequirement: {
        type: "string",
        enum: [
          "VISA_FREE",
          "VISA_ON_ARRIVAL",
          "ETA",
          "EVISA",
          "VISA_REQUIRED",
          "CONDITIONAL_WAIVER",
          "ADMISSION_REFUSED",
          "SPECIAL_TERRITORY",
        ],
        description: "The main visa requirement",
      },
      duration: {
        type: "object",
        properties: {
          maxStayDays: {
            type: "number",
            description: "Maximum stay in days",
          },
          description: {
            type: "string",
            description: "Human readable maximum stay description",
          },
        },
        required: ["maxStayDays", "description"],
        additionalProperties: false,
      },
      conditions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [
                "REQUIRES_VISA",
                "REQUIRES_DOCUMENT",
                "REQUIRES_RESIDENCY",
                "REQUIRES_PURPOSE",
                "REQUIRES_ARRIVAL_METHOD",
                "REQUIRES_DEPARTURE",
                "AGE_RESTRICTION",
                "OTHER",
              ],
              description: "Type of condition that applies",
            },
            description: {
              type: "string",
              description: "Explanation of this condition",
            },
            logic: {
              type: "string",
              enum: ["AND", "OR"],
              description: "Logic if multiple conditions apply",
            },
            requiredVisas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issuingCountry: {
                    type: "string",
                    description: "Country issuing the visa",
                  },
                  issuingCountryCode: {
                    type: "string",
                    description: "ISO code for issuing country",
                  },
                  mustBeValid: {
                    type: "boolean",
                    description: "Must visa be currently valid",
                  },
                  mustBeUsed: {
                    type: "boolean",
                    description: "Whether visa must have been used for entry",
                  },
                },
                required: [
                  "issuingCountry",
                  "issuingCountryCode",
                  "mustBeValid",
                  "mustBeUsed",
                ],
                additionalProperties: false,
              },
              description:
                "Array of visas that may be required under this condition",
            },
            requiredDocuments: {
              type: "array",
              items: {
                type: "string",
              },
              description: "List of document names required",
            },
            durationIfMet: {
              type: "object",
              properties: {
                maxStayDays: {
                  type: "number",
                  description: "Maximum stay in days if condition is met",
                },
                description: {
                  type: "string",
                  description:
                    "Human readable stay description if condition is met",
                },
              },
              required: ["maxStayDays", "description"],
              additionalProperties: false,
              description: "Duration allowed if this condition is satisfied",
            },
          },
          // ❌ REMOVE THIS - Don't require all nested fields
          // required: [
          //   "type",
          //   "description",
          //   "logic",
          //   "requiredVisas",
          //   "requiredDocuments",
          //   "durationIfMet",
          // ],
          // ✅ REPLACE WITH THIS - Only require essential fields
          required: ["type", "description"],
          additionalProperties: false,
        },
        description: "Array of special conditions that apply",
      },
      entryType: {
        type: "string",
        enum: ["SINGLE", "MULTIPLE", "TRANSIT_ONLY", "UNSPECIFIED"],
        description: "Type of permitted entry",
      },
      processingTime: {
        type: "string",
        description: "How long visa processing takes",
      },
      restrictions: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Special restrictions that may apply",
      },
      sourceUrl: {
        type: "string",
        description: "Source URL for this information",
      },
      lastVerified: {
        type: "string",
        format: "date",
        description: "Date the information was last verified (ISO format)",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Your confidence in parsing",
      },
    },
    required: [
      "destinationCountryCd",
      "originCountryCd",
      "primaryRequirement",
      "confidence",
    ],
    additionalProperties: false,
  },
} as const;
