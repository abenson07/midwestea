export interface CourseEnrollmentContent {
  scheduleNarrative: (data: { startDateLabel: string; endDateLabel: string }) => string;
  courseMaterialBlurb: string;
}

/** Fallback content for any course_code without bespoke copy authored yet. */
export const defaultEnrollmentContent: CourseEnrollmentContent = {
  scheduleNarrative: ({ endDateLabel }) =>
    `Your class runs through ${endDateLabel}. Be sure to have your prerequisites completed ahead of time. See information on that below.`,
  courseMaterialBlurb:
    'Course material will be provided to you on your first day of class. Online content will be unlocked that day too.',
};
