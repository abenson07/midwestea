import { defaultEnrollmentContent, type CourseEnrollmentContent } from './default';
import { paramedicEnrollmentContent } from './paramedic';

export type { CourseEnrollmentContent };

const ENROLLMENT_CONTENT_BY_COURSE_CODE: Record<string, CourseEnrollmentContent> = {
  PARA: paramedicEnrollmentContent,
};

/**
 * Look up per-course enrollment-email narrative content, falling back to generic
 * copy for any course_code without bespoke content authored yet. Add a new entry
 * here (and a new file in this directory) as each program/course needs its own
 * enrollment-email narrative — see apps/webapp/emails/EMAILS-GUIDE.md.
 */
export function getEnrollmentContent(courseCode: string): CourseEnrollmentContent {
  return ENROLLMENT_CONTENT_BY_COURSE_CODE[courseCode.toUpperCase()] || defaultEnrollmentContent;
}
