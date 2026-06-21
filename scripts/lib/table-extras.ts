/**
 * Indexes, constraints, sequences, and RLS applied after CREATE TABLE.
 * Sourced from repo migrations + live DB requirements (e.g. FK on course_code).
 */

export function getTableExtras(tableName: string): string {
  switch (tableName) {
    case 'courses':
      return `
CREATE UNIQUE INDEX IF NOT EXISTS courses_course_code_key ON public.courses(course_code);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages courses"
  ON public.courses FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read courses"
  ON public.courses FOR SELECT TO authenticated
  USING (true);
`;

    case 'locations':
      return `
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages locations"
  ON public.locations FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read locations"
  ON public.locations FOR SELECT TO authenticated
  USING (true);
`;

    case 'classes':
      return `
CREATE INDEX IF NOT EXISTS idx_classes_course_uuid ON public.classes(course_uuid);
CREATE INDEX IF NOT EXISTS idx_classes_course_code ON public.classes(course_code);
CREATE INDEX IF NOT EXISTS idx_classes_location_id ON public.classes(location_id);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages classes"
  ON public.classes FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read classes"
  ON public.classes FOR SELECT TO authenticated
  USING (true);
`;

    case 'students':
      return `
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages students"
  ON public.students FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read students"
  ON public.students FOR SELECT TO authenticated
  USING (true);
`;

    case 'enrollments':
      return `
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON public.enrollments(class_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages enrollments"
  ON public.enrollments FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read enrollments"
  ON public.enrollments FOR SELECT TO authenticated
  USING (true);
`;

    case 'transactions':
      return `
CREATE INDEX IF NOT EXISTS idx_transactions_enrollment_id ON public.transactions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON public.transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_class_id ON public.transactions(class_id);
CREATE INDEX IF NOT EXISTS idx_transactions_downloaded ON public.transactions(downloaded);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages transactions"
  ON public.transactions FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (true);
`;

    case 'waitlist':
      return `
CREATE INDEX IF NOT EXISTS idx_waitlist_student_id ON public.waitlist(student_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_course_code ON public.waitlist(course_code);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages waitlist"
  ON public.waitlist FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read waitlist"
  ON public.waitlist FOR SELECT TO authenticated
  USING (true);
`;

    case 'payments':
      return `
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON public.payments(enrollment_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages payments"
  ON public.payments FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read payments"
  ON public.payments FOR SELECT TO authenticated
  USING (true);
`;

    case 'admins':
      return `
CREATE UNIQUE INDEX IF NOT EXISTS admins_email_key ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_deleted_at ON public.admins(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read admins"
  ON public.admins FOR SELECT TO authenticated
  USING (deleted_at IS NULL);
CREATE POLICY "Service role can manage admins"
  ON public.admins FOR ALL TO service_role
  USING (true) WITH CHECK (true);
`;

    case 'logs':
      return `
ALTER TABLE public.logs
  ADD CONSTRAINT logs_reference_type_check
  CHECK (reference_type IN ('program', 'course', 'class', 'student'));

ALTER TABLE public.logs
  ADD CONSTRAINT logs_action_type_check
  CHECK (action_type IN (
    'detail_updated',
    'class_created',
    'class_deleted',
    'student_added',
    'student_removed',
    'student_registered',
    'payment_success',
    'webflow_synced'
  ));

CREATE INDEX IF NOT EXISTS idx_logs_reference_id ON public.logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_logs_reference_type ON public.logs(reference_type);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_admin_user_id ON public.logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_logs_student_id ON public.logs(student_id);
CREATE INDEX IF NOT EXISTS idx_logs_class_id ON public.logs(class_id);
CREATE INDEX IF NOT EXISTS idx_logs_batch_id ON public.logs(batch_id);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can insert logs"
  ON public.logs FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Authenticated users can read logs"
  ON public.logs FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can insert logs"
  ON public.logs FOR INSERT TO authenticated
  WITH CHECK (true);
`;

    case 'invoices_to_import':
      return `
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 100001;

CREATE INDEX IF NOT EXISTS idx_invoices_to_import_invoice_number ON public.invoices_to_import(invoice_number DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_payment_id ON public.invoices_to_import(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_to_import_class_id ON public.invoices_to_import(class_id);

ALTER TABLE public.invoices_to_import ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can insert invoices"
  ON public.invoices_to_import FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Authenticated users can read invoices"
  ON public.invoices_to_import FOR SELECT TO authenticated
  USING (true);
`;

    case 'email_logs':
      return `
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_enrollment_id ON public.email_logs(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_student_id ON public.email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_success ON public.email_logs(success);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can insert email logs"
  ON public.email_logs FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Service role can read email logs"
  ON public.email_logs FOR SELECT TO service_role
  USING (true);
CREATE POLICY "Authenticated users can read email logs"
  ON public.email_logs FOR SELECT TO authenticated
  USING (true);
`;

    default:
      return '';
  }
}

/** After inserting into logs with explicit bigint ids. */
export function logsSequenceResetSql(): string {
  return `
SELECT setval(
  pg_get_serial_sequence('public.logs', 'id'),
  COALESCE((SELECT MAX(id) FROM public.logs), 1)
);
`;
}
