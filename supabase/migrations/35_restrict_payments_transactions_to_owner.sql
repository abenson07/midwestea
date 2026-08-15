-- Migration 35: Restrict payments/transactions SELECT back to row owner
--
-- Same drift pattern as migration 34, on two more tables: production's
-- SELECT policies on `payments` and `transactions` had been replaced with
-- "Authenticated users read payments" / "Authenticated users read
-- transactions", both USING (true) - any authenticated user (any student)
-- could read every payment and every transaction record, not just their
-- own. Never captured in a migration.
--
-- Unlike migration 34 (students/enrollments), no admin OR-clause is needed
-- here. Checked every live caller: the admin transaction list, the class
-- detail transaction view, and the reconcile page all already read through
-- the protected /api/admin/transactions route (service role, bypasses RLS
-- entirely) via fetchAdminTransactions() in lib/payments.ts - none of them
-- depend on the anon-key client or this policy. A handful of other
-- functions in that same file (getPayments, getPayoutsToReconcile,
-- getReconciledPayouts) do query these tables directly with the anon-key
-- client, but have no callers anywhere in the app - dead code, not a live
-- dependency.
--
-- One intentional deviation from migration 11's original text: that
-- version's transactions policy was `student_id IS NULL OR EXISTS (...)`,
-- which would let any authenticated user read every transaction missing a
-- student_id, not just their own. No code path (checked lib/enrollments.ts's
-- createTransaction and the legacy insert path, and every insert site in
-- the Stripe webhook handler) ever creates a transaction without a
-- student_id, and a live count confirmed zero existing rows have a null
-- student_id, so that clause is dropped rather than carried forward.
--
-- Applied directly to production via the SQL editor ahead of this
-- migration/PR, for the same reason as migration 34: this was a live,
-- actively-exploitable data exposure. This file exists so the fix is
-- tracked and reproducible for other environments, not because it's still
-- pending.

DROP POLICY IF EXISTS "Authenticated users read payments" ON payments;
DROP POLICY IF EXISTS "Authenticated users read transactions" ON transactions;

CREATE POLICY "Authenticated users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN students ON students.id = enrollments.student_id
      WHERE enrollments.id = payments.enrollment_id
      AND students.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = transactions.student_id
      AND students.id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFY (run manually in the Supabase SQL editor)
-- ============================================================================
-- select tablename, policyname, cmd, roles, qual
-- from pg_policies
-- where tablename in ('payments','transactions')
-- order by tablename, cmd;
