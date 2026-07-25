"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSession, refreshSession } from "@/lib/auth";
import { getStudentById, type StudentWithEmail } from "@/lib/students";
import { formatPhone } from "@midwestea/utils";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

interface ProfileFormState {
  full_name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  t_shirt_size: string;
}

function toFormState(student: StudentWithEmail | null, email: string): ProfileFormState {
  return {
    full_name: student?.full_name || "",
    email,
    phone: student?.phone || "",
    emergency_contact_name: student?.emergency_contact_name || "",
    emergency_contact_phone: student?.emergency_contact_phone || "",
    t_shirt_size: student?.t_shirt_size || "",
  };
}

export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentWithEmail | null>(null);
  // Email lives on auth.users, not the students row, and the admin-gated
  // /api/students/[id]/email route getStudentById calls internally can't be
  // used by a student for their own email — read it straight off the session.
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(toFormState(null, ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { session } = await getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const sessionEmail = session.user.email || "";
    setEmail(sessionEmail);
    const { student: fetchedStudent } = await getStudentById(session.user.id);
    setStudent(fetchedStudent);
    setForm(toFormState(fetchedStudent, sessionEmail));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenSidebar = () => {
    setForm(toFormState(student, email));
    setError("");
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setError("");
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { session } = await getSession();
    if (!session) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    try {
      const patchResponse = await fetch("/api/students/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
          t_shirt_size: form.t_shirt_size,
        }),
      });
      const patchResult = await patchResponse.json().catch(() => ({}));
      if (!patchResponse.ok || !patchResult.success) {
        setError(patchResult.error || "Failed to save profile");
        setSaving(false);
        return;
      }

      if (form.email && form.email !== email) {
        const emailResponse = await fetch("/api/students/me/update-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email: form.email }),
        });
        const emailResult = await emailResponse.json().catch(() => ({}));
        if (!emailResponse.ok || !emailResult.success) {
          setError(emailResult.error || "Failed to update email");
          setSaving(false);
          return;
        }
        // The client's JWT still carries the old email claim until reissued;
        // force a refresh so the session (and every page reading it) reflects
        // the new email immediately.
        await refreshSession();
      }

      setIsSidebarOpen(false);
      setSaving(false);
      await load();
    } catch {
      setError("Failed to save profile");
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-500">Full Name</label>
          <p className="mt-1 text-sm text-gray-900">{student?.full_name || "—"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1 text-sm text-gray-900">{email || "—"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Phone</label>
          <p className="mt-1 text-sm text-gray-900">{student?.phone || "—"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">T-Shirt Size</label>
          <p className="mt-1 text-sm text-gray-900">{student?.t_shirt_size || "—"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Emergency Contact Name</label>
          <p className="mt-1 text-sm text-gray-900">{student?.emergency_contact_name || "—"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Emergency Contact Phone</label>
          <p className="mt-1 text-sm text-gray-900">{student?.emergency_contact_phone || "—"}</p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleOpenSidebar}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
          >
            Edit profile
          </button>
        </div>
      </div>

      <DetailSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} title="Edit profile">
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">T-Shirt Size</label>
            <input
              type="text"
              value={form.t_shirt_size}
              onChange={(e) => setForm({ ...form, t_shirt_size: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
            <input
              type="text"
              value={form.emergency_contact_name}
              onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
            <input
              type="tel"
              value={form.emergency_contact_phone}
              onChange={(e) => setForm({ ...form, emergency_contact_phone: formatPhone(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>

          {/* has_required_info, stripe_customer_id, and vaccination_card_url are
              intentionally not part of this form — staff-managed via the admin
              students page. */}

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseSidebar}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DetailSidebar>
    </div>
  );
}
