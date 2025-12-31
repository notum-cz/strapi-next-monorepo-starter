import type { ValidationResult } from './types';

/**
 * Fact-Checking and Validation System
 * Prevents AI hallucination by cross-checking responses against verified sources
 */

// Patterns that indicate potential hallucinations
const HALLUCINATION_PATTERNS = [
  // Large numbers without sources
  {
    pattern: /\b\d{1,3}[,.]?\d{3}\+?\s+(students|youth|volunteers|people|families|acres|hectares)/i,
    issue: 'Large number claim without source verification',
  },
  // Future promises
  {
    pattern: /will (generate|produce|create|raise|achieve|build|construct).*\$\d+/i,
    issue: 'Unverified future financial projection',
  },
  // Overconfident language
  {
    pattern: /\b(certain|guaranteed|definitely|absolutely|undoubtedly) (will|shall|must)/i,
    issue: 'Overconfident prediction language',
  },
  // Specific dates without context
  {
    pattern: /\b(started|began|launched|completed|finished) (in|on) (19|20)\d{2}\b/i,
    issue: 'Specific date claim requiring verification',
  },
  // Financial claims
  {
    pattern: /\$([\d,]+) (raised|generated|earned|received|donated)/i,
    issue: 'Financial claim requiring verification',
  },
  // Partnership claims
  {
    pattern: /partnered with [A-Z][a-z]+ (Corporation|Company|Foundation|Organization)/i,
    issue: 'Partnership claim requiring verification',
  },
];

// Extract markdown section for a specific stage
export function extractMarkdownSection(markdown: string, stageId: string): string {
  // Convert stage_id to title pattern (e.g., "season-1" -> "Season 1")
  const stageTitle = stageId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Find the section in markdown
  const regex = new RegExp(`## ${stageTitle}[\\s\\S]*?(?=## |$)`, 'i');
  const match = markdown.match(regex);

  return match ? match[0] : '';
}

/**
 * Validate AI response against markdown source
 */
export async function validateResponse(
  stageId: string,
  response: string,
  markdown: string
): Promise<ValidationResult> {
  const issues: string[] = [];

  // Check for hallucination patterns
  HALLUCINATION_PATTERNS.forEach(({ pattern, issue }) => {
    const matches = response.match(pattern);
    if (matches) {
      issues.push(`${issue}: "${matches[0]}"`);
    }
  });

  // Extract relevant section from markdown
  const timelineExcerpt = extractMarkdownSection(markdown, stageId);

  if (!timelineExcerpt) {
    issues.push(`No markdown documentation found for stage: ${stageId}`);
    return { valid: false, issues };
  }

  // Extract key phrases from response (dates, numbers, names)
  const keyPhrases = extractKeyPhrases(response);

  // Verify each key phrase exists in markdown
  keyPhrases.forEach((phrase) => {
    if (!timelineExcerpt.toLowerCase().includes(phrase.toLowerCase())) {
      issues.push(`Unverified claim: "${phrase}" not found in timeline documentation`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Extract key phrases that need verification
 */
function extractKeyPhrases(text: string): string[] {
  const phrases: string[] = [];

  // Extract numbers with units
  const numberMatches = text.match(/\b\d+[,.]?\d*\s+(acres|hectares|students|people|families|volunteers|dollars|%)\b/gi);
  if (numberMatches) phrases.push(...numberMatches);

  // Extract dates
  const dateMatches = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi);
  if (dateMatches) phrases.push(...dateMatches);

  // Extract year mentions
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches) phrases.push(...yearMatches);

  // Extract proper names (capitalized phrases)
  const nameMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g);
  if (nameMatches) {
    // Filter out common words
    const filtered = nameMatches.filter(
      (name) => !['New World Kids', 'Proyecto Indigo Azul', 'The', 'This', 'That'].includes(name)
    );
    phrases.push(...filtered);
  }

  // Extract location names
  const locationMatches = text.match(/\b[A-Z][a-z]+,\s+[A-Z][a-z]+\b/g);
  if (locationMatches) phrases.push(...locationMatches);

  return [...new Set(phrases)]; // Remove duplicates
}

/**
 * Check if a claim is too specific without source
 */
export function isClaimTooSpecific(claim: string): boolean {
  // Very specific numbers (e.g., "1,247 students")
  if (/\b\d{1,3},\d{3}\s+\w+/.test(claim)) return true;

  // Specific dates (e.g., "March 15, 2023")
  if (/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/.test(claim)) return true;

  // Specific dollar amounts (e.g., "$47,293")
  if (/\$\d{1,3}(,\d{3})+/.test(claim)) return true;

  return false;
}

/**
 * Generate suggested response corrections
 */
export function suggestCorrections(response: string, validationResult: ValidationResult): string {
  if (validationResult.valid) return response;

  let corrected = response;

  // Add source citation reminders
  validationResult.issues.forEach((issue) => {
    if (issue.includes('not found in timeline')) {
      const phrase = issue.match(/"([^"]+)"/)?.[1];
      if (phrase) {
        corrected = corrected.replace(
          phrase,
          `${phrase} [Citation needed - not found in timeline documentation]`
        );
      }
    }
  });

  // Add uncertainty language for overconfident claims
  corrected = corrected.replace(/\b(certain|guaranteed|definitely) will\b/gi, 'is planned to');
  corrected = corrected.replace(/\babsolutely will\b/gi, 'aims to');

  return corrected;
}

/**
 * Verify that a response only contains information from verified sources
 */
export function verifySourcedClaims(
  response: string,
  markdownSource: string,
  strapiData: any
): { verified: boolean; unsourcedClaims: string[] } {
  const keyPhrases = extractKeyPhrases(response);
  const unsourcedClaims: string[] = [];

  keyPhrases.forEach((phrase) => {
    const inMarkdown = markdownSource.toLowerCase().includes(phrase.toLowerCase());
    const inStrapi = JSON.stringify(strapiData).toLowerCase().includes(phrase.toLowerCase());

    if (!inMarkdown && !inStrapi) {
      unsourcedClaims.push(phrase);
    }
  });

  return {
    verified: unsourcedClaims.length === 0,
    unsourcedClaims,
  };
}

/**
 * Format validation issues for logging
 */
export function formatValidationIssues(issues: string[]): string {
  if (issues.length === 0) return 'No issues found - response verified';

  return `Validation Issues:\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}`;
}

/**
 * Create a fact-checked response template
 */
export function createFactCheckedResponse(
  response: string,
  sources: string[],
  stageId: string
): string {
  return `${response}

**Sources:**
${sources.map((source) => `- ${source}`).join('\n')}

_This response is fact-checked against verified timeline documentation for ${stageId}._`;
}

/**
 * Validate upload file
 */
export function validateUploadFile(file: File, allowedTypes: string[], maxSize: number): ValidationResult {
  const issues: string[] = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    issues.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    issues.push(`File size ${fileSizeMB}MB exceeds maximum ${maxSizeMB}MB`);
  }

  // Check file name
  if (file.name.length > 255) {
    issues.push('File name is too long (max 255 characters)');
  }

  // Check for potentially malicious file names
  if (/[<>:"|?*]/.test(file.name)) {
    issues.push('File name contains invalid characters');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
