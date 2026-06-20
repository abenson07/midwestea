/**
 * Maps URL slugs to course codes
 * This is hand-coded and can be expanded as needed
 */
const SLUG_TO_COURSE_CODE: Record<string, string> = {
  // Emergency Medical Response
  'emergency-medical-response': 'EMR',
  'emr': 'EMR',
  
  // Paramedic
  'paramedic': 'PARA',
  'para': 'PARA',
  
  // Critical Care Transport
  'critical-care-transport': 'CCT',
  'cct': 'CCT',
  
  // Emergency Medical Technician
  'emergency-medical-technician': 'EMT',
  'emt': 'EMT',
  
  // Community Paramedic
  'community-paramedic': 'CP',
  'cp': 'CP',
  
  // Advanced Tactical Casualty Care
  'advanced-tactical-casualty-care': 'ATCC',
  'atcc': 'ATCC',
  
  // Advanced Cardiovascular Life Support
  'advanced-cardiovascular-life-support': 'ACLS',
  'acls': 'ACLS',
  
  // Basic Life Support
  'basic-life-support': 'BLS',
  'bls': 'BLS',
  
  // CPR / First Aid
  'cpr-first-aid': 'CPR',
  'cpr': 'CPR',
  'first-aid': 'CPR',
  
  // Child & Babysitting Safety
  'child-babysitting-safety': 'CABS',
  'child-and-babysitting-safety': 'CABS',
  'cabs': 'CABS',

  // Active Violence Emergency Response
  'active-violence-emergency-response': 'AVERT',
  'active-shooter-training': 'AVERT',
  'avert': 'AVERT',

  // Pediatric CPR / First Aid
  'pediatric-cpr': 'PEDS',
  'pediatric-first-aid-cpr-aed': 'PEDS',
  'peds': 'PEDS',

  // Emergency Medical Responder
  'emergency-medical-responder': 'EMR',

  // Emergency Oxygen
  'emergency-oxygen': 'OXY',
  'emergency-use-of-medical-oxygen': 'OXY',
  'oxy': 'OXY',

  // Epinephrine
  'epinephrine': 'EPI',
  'use-and-administration-of-epinephrine-auto-injectors': 'EPI',
  'epi': 'EPI',

  // Pediatric Advanced Life Support
  'pediatric-advanced-life-support': 'PALS',
  'pals': 'PALS',

  // Bloodborne Pathogens
  'bloodborne-pathogens': 'PATH',
  'path': 'PATH',
  'bloodborne-pathodgens': 'PATH',
};

/**
 * Get course code from URL slug
 */
export function getCourseCodeFromSlug(slug: string): string | null {
  const normalizedSlug = slug.toLowerCase().trim();
  return SLUG_TO_COURSE_CODE[normalizedSlug] || null;
}

/**
 * Get all available slugs (for reference)
 */
export function getAllSlugs(): string[] {
  return Object.keys(SLUG_TO_COURSE_CODE);
}


