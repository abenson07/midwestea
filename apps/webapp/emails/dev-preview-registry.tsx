import * as React from 'react';
import WaitlistSuccessful from './waitlist-successful';
import RateClass from './rate-class';
import WaitlistOpens from './waitlist-opens';
import WaitlistSpotOpens from './waitlist-spot-opens';
import OtpLoginCode from './otp-login-code';
import EnrollmentSuccessful from './enrollment-successful';
import ClassReminder from './class-reminder';
import CompletedClassFollowups from './completed-class-followups';

export type FieldType = 'text' | 'textarea' | 'json';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  /**
   * If set, this field is populated entirely from the selected class and hidden
   * from the form — it "comes with the class" (course code, hero image, etc.)
   * rather than being something to hand-edit.
   */
  classLink?: 'courseName' | 'courseCode' | 'classImage' | 'classStartDate' | 'enrollmentClose';
  /**
   * If set, this is one of the two "installments" due-date fields for Enrollment
   * Successful — rendered as a plain date field instead of exposing the raw
   * installments JSON array. The page assembles the real `installments` prop
   * from installmentIndex 1 and 2 (fixed labels "First installment"/"Second
   * installment").
   */
  installmentIndex?: 1 | 2;
  /** If set, this field is hidden from the form entirely — its default value still flows into props. */
  hidden?: boolean;
  /**
   * If set, this field (a JSON array of upsell courses) is driven by the real-courses
   * checklist widget instead of a raw JSON textarea.
   */
  courseChecklist?: boolean;
}

export interface TemplateDef {
  key: string;
  label: string;
  component: React.ComponentType<any>;
  fields: FieldDef[];
  /** Whether this template shows the class picker at all. */
  hasClassPicker: boolean;
}

export const EMAIL_TEMPLATES: TemplateDef[] = [
  {
    key: 'waitlist-successful',
    label: 'Waitlist Successful',
    component: WaitlistSuccessful,
    hasClassPicker: true,
    fields: [
      { key: 'studentName', label: 'Student name', type: 'text' },
      { key: 'courseName', label: 'Course name', type: 'text', classLink: 'courseName' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', classLink: 'classImage' },
      { key: 'supportUrl', label: 'Support URL', type: 'text' },
    ],
  },
  {
    key: 'rate-class',
    label: 'Rate Class',
    component: RateClass,
    hasClassPicker: true,
    fields: [
      { key: 'className', label: 'Class name', type: 'text', classLink: 'courseName' },
      { key: 'reviewUrl', label: 'Review URL (with query params)', type: 'text' },
    ],
  },
  {
    key: 'waitlist-opens',
    label: 'Waitlist Opens',
    component: WaitlistOpens,
    hasClassPicker: true,
    fields: [
      { key: 'studentName', label: 'Student name', type: 'text' },
      { key: 'className', label: 'Class name', type: 'text', classLink: 'courseName' },
      { key: 'startDate', label: 'Start date', type: 'text', classLink: 'classStartDate' },
      { key: 'registrationCloseDate', label: 'Registration close date', type: 'text', classLink: 'enrollmentClose' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', classLink: 'classImage' },
      { key: 'registerUrl', label: 'Register URL', type: 'text' },
    ],
  },
  {
    key: 'waitlist-spot-opens',
    label: 'Waitlist Spot Opens',
    component: WaitlistSpotOpens,
    hasClassPicker: true,
    fields: [
      { key: 'studentName', label: 'Student name', type: 'text' },
      { key: 'className', label: 'Class name', type: 'text', classLink: 'courseName' },
      { key: 'startDate', label: 'Start date', type: 'text', classLink: 'classStartDate' },
      { key: 'registrationCloseDate', label: 'Registration close date', type: 'text', classLink: 'enrollmentClose' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', classLink: 'classImage' },
      { key: 'registerUrl', label: 'Register URL', type: 'text' },
    ],
  },
  {
    key: 'otp-login-code',
    label: 'OTP / Login code',
    component: OtpLoginCode,
    hasClassPicker: false,
    fields: [{ key: 'code', label: '8-digit code', type: 'text' }],
  },
  {
    key: 'enrollment-successful',
    label: 'Enrollment Successful',
    component: EnrollmentSuccessful,
    hasClassPicker: true,
    fields: [
      { key: 'studentName', label: 'Student name', type: 'text' },
      { key: 'courseCode', label: 'Course code', type: 'text', classLink: 'courseCode' },
      { key: 'courseName', label: 'Course name', type: 'text', classLink: 'courseName' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', classLink: 'classImage' },
      { key: 'startDateLabel', label: 'Start date label', type: 'text', classLink: 'classStartDate' },
      { key: 'endDateLabel', label: 'End date label', type: 'text' },
      { key: 'remainingCost', label: 'Remaining cost (blank = no installment section)', type: 'text' },
      { key: 'installmentDate1', label: 'First installment due date', type: 'text', installmentIndex: 1 },
      { key: 'installmentDate2', label: 'Second installment due date', type: 'text', installmentIndex: 2 },
      { key: 'invoicesUrl', label: 'Invoices URL', type: 'text', hidden: true },
      { key: 'portalLoginUrl', label: 'Portal login URL', type: 'text', hidden: true },
      { key: 'prerequisites', label: 'Prerequisites (JSON array, blank = no section)', type: 'json', hidden: true },
      { key: 'prerequisiteDueDate', label: 'Prerequisite due date', type: 'text' },
    ],
  },
  {
    key: 'class-reminder',
    label: 'Class Reminder',
    component: ClassReminder,
    hasClassPicker: true,
    fields: [
      { key: 'studentName', label: 'Student name', type: 'text' },
      { key: 'className', label: 'Class name', type: 'text', classLink: 'courseName' },
      { key: 'startDate', label: 'Start date', type: 'text', classLink: 'classStartDate' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', classLink: 'classImage' },
      { key: 'prerequisiteDueDate', label: 'Prerequisite due date', type: 'text' },
      { key: 'missingPrerequisites', label: 'Missing prerequisites (JSON array)', type: 'json', hidden: true },
    ],
  },
  {
    key: 'completed-class-followups',
    label: 'Completed Class + Suggested Followups',
    component: CompletedClassFollowups,
    hasClassPicker: true,
    fields: [
      { key: 'studentName', label: 'Student name', type: 'text' },
      { key: 'className', label: 'Class name', type: 'text', classLink: 'courseName' },
      { key: 'certificateUrl', label: 'Certificate URL', type: 'text', hidden: true },
      {
        key: 'suggestedFollowUps',
        label: 'Suggested follow-ups (JSON array)',
        type: 'json',
        courseChecklist: true,
      },
      { key: 'allCoursesUrl', label: 'All courses URL', type: 'text', hidden: true },
    ],
  },
];

export function getTemplate(key: string): TemplateDef | undefined {
  return EMAIL_TEMPLATES.find((t) => t.key === key);
}
