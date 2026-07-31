'use client';

import { useEffect, useMemo, useState } from 'react';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'json';
  classLink?: 'courseName' | 'courseCode' | 'classImage' | 'classStartDate' | 'enrollmentClose';
  installmentIndex?: 1 | 2;
  hidden?: boolean;
  courseChecklist?: boolean;
}

interface TemplateInfo {
  key: string;
  label: string;
  hasClassPicker: boolean;
  fields: FieldDef[];
  defaultProps: Record<string, unknown>;
}

interface ClassOption {
  id: string;
  label: string;
  courseName: string;
  courseCode: string;
  classImage: string | null;
  classStartDate: string | null;
  enrollmentClose: string | null;
}

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  courseImage: string | null;
}

function formatDateLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const TEST_RECIPIENT = 'alex@midwesternoriginals.com';
const DEFAULT_COURSE_CHECKLIST_COUNT = 4;

function buildProps(
  template: TemplateInfo,
  values: Record<string, string>
): { props: Record<string, unknown>; errors: Record<string, string> } {
  const props: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const installments: { index: number; label: string; date: string }[] = [];

  for (const field of template.fields) {
    const raw = values[field.key];

    if (field.installmentIndex) {
      if (raw && raw.trim() !== '') {
        installments.push({
          index: field.installmentIndex,
          label: field.installmentIndex === 1 ? 'First installment' : 'Second installment',
          date: raw,
        });
      }
      continue;
    }

    if (field.type === 'json') {
      if (!raw || raw.trim() === '') {
        props[field.key] = undefined;
        continue;
      }
      try {
        props[field.key] = JSON.parse(raw);
      } catch (e: any) {
        errors[field.key] = 'Invalid JSON';
      }
    } else {
      props[field.key] = raw === '' ? undefined : raw;
    }
  }

  if (installments.length > 0) {
    props.installments = installments.sort((a, b) => a.index - b.index).map(({ label, date }) => ({ label, date }));
  }

  return { props, errors };
}

function classOverlayFor(template: TemplateInfo, cls: ClassOption): Record<string, string> {
  const overlay: Record<string, string> = {};
  for (const field of template.fields) {
    if (!field.classLink) continue;
    if (field.classLink === 'courseName') overlay[field.key] = cls.courseName || '';
    if (field.classLink === 'courseCode') overlay[field.key] = cls.courseCode || '';
    if (field.classLink === 'classImage') overlay[field.key] = cls.classImage || '';
    if (field.classLink === 'classStartDate') overlay[field.key] = formatDateLabel(cls.classStartDate);
    if (field.classLink === 'enrollmentClose') overlay[field.key] = formatDateLabel(cls.enrollmentClose);
  }
  return overlay;
}

// Course detail URL pattern is unconfirmed (no public course-detail route was found in the
// codebase) — using this as a reasonable placeholder, flag if the real pattern differs.
function courseHref(courseCode: string): string {
  return `https://midwestea.com/courses/${courseCode.toLowerCase()}`;
}

export default function EmailPreviewDevTool() {
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [html, setHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const template = useMemo(() => templates.find((t) => t.key === selectedKey), [templates, selectedKey]);

  const courseChecklistField = useMemo(
    () => template?.fields.find((f) => f.courseChecklist),
    [template]
  );

  // Fields actually shown as plain inputs — class-linked, hidden, and course-checklist
  // fields are either populated silently or rendered by a dedicated widget instead.
  const visibleFields = useMemo(
    () => (template ? template.fields.filter((f) => !f.classLink && !f.hidden && !f.courseChecklist) : []),
    [template]
  );

  // Load templates, classes, and courses once
  useEffect(() => {
    fetch('/api/dev/render-email')
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data.templates || []);
        if (data.templates?.length) setSelectedKey(data.templates[0].key);
      });
    fetch('/api/dev/classes')
      .then((r) => r.json())
      .then((data) => {
        const list = data.classes || [];
        setClasses(list);
        if (list.length) setSelectedClassId(list[0].id);
      })
      .catch(() => setClasses([]));
    fetch('/api/dev/courses')
      .then((r) => r.json())
      .then((data) => {
        const list: CourseOption[] = data.courses || [];
        setCourses(list);
        if (list.length) setSelectedCourseIds(list.slice(0, DEFAULT_COURSE_CHECKLIST_COUNT).map((c) => c.id));
      })
      .catch(() => setCourses([]));
  }, []);

  // Reset ALL fields to the template's defaults whenever the selected template changes
  // (does not touch selectedClassId/selectedCourseIds — those choices persist across templates).
  useEffect(() => {
    if (!template) return;
    const next: Record<string, string> = {};
    const installments = (template.defaultProps.installments as { date?: string }[] | undefined) || [];

    for (const field of template.fields) {
      if (field.installmentIndex) {
        next[field.key] = installments[field.installmentIndex - 1]?.date || '';
        continue;
      }
      const raw = template.defaultProps[field.key];
      next[field.key] = field.type === 'json' ? JSON.stringify(raw ?? [], null, 2) : String(raw ?? '');
    }
    setValues(next);
    setJsonErrors({});
    setSendStatus('idle');
    setCopied(false);
  }, [template]);

  // Overlay class-derived fields whenever the template or the selected class changes.
  useEffect(() => {
    if (!template || !selectedClassId) return;
    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return;
    const overlay = classOverlayFor(template, cls);
    setValues((prev) => ({ ...prev, ...overlay }));
  }, [template, selectedClassId, classes]);

  // Build the course-checklist field's JSON value from the selected real courses.
  useEffect(() => {
    if (!template || !courseChecklistField) return;
    const selected = courses.filter((c) => selectedCourseIds.includes(c.id));
    const followUps = selected.map((c) => ({
      title: c.courseName,
      description: '',
      imageUrl: c.courseImage || undefined,
      href: courseHref(c.courseCode),
    }));
    setValues((prev) => ({ ...prev, [courseChecklistField.key]: JSON.stringify(followUps, null, 2) }));
  }, [template, courseChecklistField, selectedCourseIds, courses]);

  function handleFieldChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCourse(id: string) {
    setSelectedCourseIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  // Re-render whenever values change (debounced)
  useEffect(() => {
    if (!template) return;
    const timer = setTimeout(() => {
      const { props, errors } = buildProps(template, values);

      setJsonErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setLoading(true);
      fetch('/api/dev/render-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: template.key, props }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setRenderError(data.error);
            setHtml('');
          } else {
            setRenderError('');
            setHtml(data.html);
          }
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [values, template]);

  function handleSendTest() {
    if (!template) return;
    const { props, errors } = buildProps(template, values);
    if (Object.keys(errors).length > 0) {
      setSendStatus('error');
      setSendError('Fix the invalid JSON field(s) before sending.');
      return;
    }

    setSendStatus('sending');
    setSendError('');
    fetch('/api/dev/send-test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: template.key, props, to: TEST_RECIPIENT }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setSendStatus('error');
          setSendError(data.error);
        } else {
          setSendStatus('sent');
        }
      })
      .catch((e) => {
        setSendStatus('error');
        setSendError(e.message);
      });
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(values.code || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #e0e0e0',
          background: '#fff',
        }}
      >
        <strong>Email preview</strong>
        {loading && <span style={{ color: '#888', fontSize: 13 }}>Rendering…</span>}
        {renderError && <span style={{ color: '#c0392b', fontSize: 13 }}>{renderError}</span>}
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar: template, class, then props */}
        <div
          style={{
            width: 340,
            flexShrink: 0,
            overflowY: 'auto',
            padding: 16,
            borderRight: '1px solid #e0e0e0',
            background: '#fafafa',
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#333' }}>
              Email template
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }}
            >
              {templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {template?.hasClassPicker && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#333' }}>
                Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }}
              >
                <option value="">Pick a class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '16px 0' }} />

          {visibleFields.map((field) => (
            <div key={field.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#333' }}>
                {field.label}
              </label>
              {field.type === 'json' || field.type === 'textarea' ? (
                <textarea
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  rows={field.type === 'json' ? 6 : 3}
                  style={{
                    width: '100%',
                    fontFamily: field.type === 'json' ? 'monospace' : 'inherit',
                    fontSize: 12,
                    padding: 6,
                    boxSizing: 'border-box',
                    border: jsonErrors[field.key] ? '1px solid #c0392b' : '1px solid #ccc',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: 6, boxSizing: 'border-box', border: '1px solid #ccc' }}
                />
              )}
              {jsonErrors[field.key] && (
                <div style={{ color: '#c0392b', fontSize: 11, marginTop: 2 }}>{jsonErrors[field.key]}</div>
              )}
            </div>
          ))}

          {template?.key === 'otp-login-code' && (
            <div style={{ marginBottom: 14 }}>
              <button
                onClick={handleCopyCode}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: copied ? '#1a7f37' : '#ffb452',
                  color: '#191920',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy code to clipboard'}
              </button>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                This only works here in the preview tool — real email clients strip the
                JavaScript a copy button would need, so the live email doesn&apos;t have one.
              </div>
            </div>
          )}

          {courseChecklistField && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#333' }}>
                Courses to suggest ({selectedCourseIds.length} selected)
              </label>
              <div
                style={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  background: '#fff',
                }}
              >
                {courses.map((c) => (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      fontSize: 12,
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    {c.courseName}
                  </label>
                ))}
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '16px 0' }} />

          <button
            onClick={handleSendTest}
            disabled={!template || sendStatus === 'sending'}
            style={{
              width: '100%',
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 600,
              background: '#191920',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: template ? 'pointer' : 'not-allowed',
              opacity: sendStatus === 'sending' ? 0.6 : 1,
            }}
          >
            {sendStatus === 'sending' ? 'Sending…' : `Send test to ${TEST_RECIPIENT}`}
          </button>
          {sendStatus === 'sent' && (
            <div style={{ color: '#1a7f37', fontSize: 12, marginTop: 6 }}>Sent!</div>
          )}
          {sendStatus === 'error' && (
            <div style={{ color: '#c0392b', fontSize: 12, marginTop: 6 }}>{sendError}</div>
          )}
        </div>

        {/* Viewer — fits width, fixed reasonable height, scrolls internally */}
        <div style={{ flex: 1, overflow: 'auto', background: '#e5e5ea', padding: '24px 0' }}>
          <div
            style={{
              width: 640,
              maxWidth: '100%',
              margin: '0 auto',
              height: '100%',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            <iframe
              title="email preview"
              srcDoc={html}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
