import type { CourseEnrollmentContent } from './default';

/** Enrollment-email narrative content for course_code 'PARA' (Paramedic Training). */
export const paramedicEnrollmentContent: CourseEnrollmentContent = {
  scheduleNarrative: ({ endDateLabel }) =>
    `We run shift friendly classes, where you can join either a Monday or a Tuesday class. Classes will run for 6 months and end on ${endDateLabel}. Be sure to have your prerequisites completed ahead of time. See information on that below.`,
  courseMaterialBlurb:
    'Course material will be provided to you on your first day of class. Online content will be unlocked that day too.',
};
