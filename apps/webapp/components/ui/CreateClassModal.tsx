"use client";

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, DollarSign, Award, UserCheck } from 'lucide-react';
import { getPrograms, getCourses, type Course, type Class } from '@/lib/classes';

interface CreateClassModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: ClassFormData) => Promise<void> | void;
  onDelete?: () => void;
  context?: 'program' | 'course' | 'classes';
  preselectedProgramId?: string;
  preselectedCourseId?: string;
  editingClass?: Class;
  programs?: Course[];
  courses?: Course[];
}

export interface ClassFormData {
  courseId: string;
  enrollmentOpenDate: string;
  enrollmentCloseDate: string;
  classStartDate: string;
  classEndDate: string;
  classType: 'online' | 'in-person' | 'hybrid';
  programmingOffering: string;
  price: string;
  registrationFee: string;
  certificateLength: string;
  registrationLimit: string;
}

export function CreateClassModal({ 
  isOpen = true, 
  onClose = () => {}, 
  onSubmit = () => {},
  onDelete,
  context = 'classes',
  preselectedProgramId,
  preselectedCourseId,
  editingClass,
  programs: providedPrograms,
  courses: providedCourses
}: CreateClassModalProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    courseId: '',
    enrollmentOpenDate: '',
    enrollmentCloseDate: '',
    classStartDate: '',
    classEndDate: '',
    classType: 'in-person',
    programmingOffering: '',
    price: '',
    registrationFee: '',
    certificateLength: '',
    registrationLimit: ''
  });
  const [programs, setPrograms] = useState<Course[]>(providedPrograms || []);
  const [courses, setCourses] = useState<Course[]>(providedCourses || []);
  const [loadingData, setLoadingData] = useState(false);
  const [isPriceEditing, setIsPriceEditing] = useState(false);
  const [isRegistrationFeeEditing, setIsRegistrationFeeEditing] = useState(false);
  const [isCertificateLengthEditing, setIsCertificateLengthEditing] = useState(false);
  const [isRegistrationLimitEditing, setIsRegistrationLimitEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const registrationFeeInputRef = useRef<HTMLInputElement>(null);
  const certificateLengthInputRef = useRef<HTMLInputElement>(null);
  const registrationLimitInputRef = useRef<HTMLInputElement>(null);

  // Focus inputs when editing starts
  useEffect(() => {
    if (isPriceEditing && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [isPriceEditing]);

  useEffect(() => {
    if (isRegistrationFeeEditing && registrationFeeInputRef.current) {
      registrationFeeInputRef.current.focus();
      registrationFeeInputRef.current.select();
    }
  }, [isRegistrationFeeEditing]);

  useEffect(() => {
    if (isCertificateLengthEditing && certificateLengthInputRef.current) {
      certificateLengthInputRef.current.focus();
      certificateLengthInputRef.current.select();
    }
  }, [isCertificateLengthEditing]);

  useEffect(() => {
    if (isRegistrationLimitEditing && registrationLimitInputRef.current) {
      registrationLimitInputRef.current.focus();
      registrationLimitInputRef.current.select();
    }
  }, [isRegistrationLimitEditing]);

  // Fetch programs/courses if not provided
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      setLoadingData(true);
      try {
        if (context === 'program' || context === 'classes') {
          if (!providedPrograms) {
            const { programs: fetchedPrograms } = await getPrograms();
            if (fetchedPrograms) setPrograms(fetchedPrograms);
          }
        }
        if (context === 'course' || context === 'classes') {
          if (!providedCourses) {
            const { courses: fetchedCourses } = await getCourses();
            if (fetchedCourses) setCourses(fetchedCourses);
          }
        }
      } catch (error) {
        console.error('Error fetching programs/courses:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, context, providedPrograms, providedCourses]);

  // Initialize form data for edit mode or pre-selected values
  useEffect(() => {
    if (!isOpen) return;

    if (editingClass) {
      // Edit mode: pre-fill from class data
      const selectedCourse = [...programs, ...courses].find(
        c => c.id === editingClass.course_uuid
      );
      
      setFormData({
        courseId: editingClass.course_uuid,
        enrollmentOpenDate: editingClass.enrollment_start 
          ? new Date(editingClass.enrollment_start).toISOString().split('T')[0] 
          : '',
        enrollmentCloseDate: editingClass.enrollment_close 
          ? new Date(editingClass.enrollment_close).toISOString().split('T')[0] 
          : '',
        classStartDate: editingClass.class_start_date 
          ? new Date(editingClass.class_start_date).toISOString().split('T')[0] 
          : '',
        classEndDate: editingClass.class_close_date 
          ? new Date(editingClass.class_close_date).toISOString().split('T')[0] 
          : '',
        classType: editingClass.is_online ? 'online' : 'in-person',
        programmingOffering: editingClass.programming_offering || '',
        price: editingClass.price ? (editingClass.price / 100).toFixed(2) : '',
        registrationFee: editingClass.registration_fee ? (editingClass.registration_fee / 100).toFixed(2) : '',
        certificateLength: editingClass.certification_length?.toString() || '',
        registrationLimit: editingClass.registration_limit?.toString() || '',
      });
    } else {
      // Create mode: initialize with defaults
      const today = new Date().toISOString().split('T')[0];
      const preselectedId = preselectedProgramId || preselectedCourseId || '';
      
      setFormData({
        courseId: preselectedId,
        enrollmentOpenDate: today,
        enrollmentCloseDate: '',
        classStartDate: '',
        classEndDate: '',
        classType: 'in-person',
        programmingOffering: '',
        price: '',
        registrationFee: '',
        certificateLength: '',
        registrationLimit: '',
      });

      // If pre-selected, inherit fields
      if (preselectedId) {
        const selected = [...programs, ...courses].find(c => c.id === preselectedId);
        if (selected) {
          inheritFieldsFromCourse(selected);
        }
      }
    }
  }, [isOpen, editingClass, preselectedProgramId, preselectedCourseId, programs, courses]);

  // Auto-set enrollment close date when class start date is set
  useEffect(() => {
    if (formData.classStartDate && !formData.enrollmentCloseDate && !editingClass) {
      const startDate = new Date(formData.classStartDate);
      const closeDate = new Date(startDate);
      closeDate.setDate(closeDate.getDate() - 21); // 3 weeks before
      const closeDateStr = closeDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, enrollmentCloseDate: closeDateStr }));
    }
  }, [formData.classStartDate, editingClass]);

  // Helper function to inherit fields from course/program
  const inheritFieldsFromCourse = (course: Course) => {
    setFormData(prev => ({
      ...prev,
      programmingOffering: course.programming_offering || prev.programmingOffering,
      price: course.price ? (course.price / 100).toFixed(2) : prev.price,
      registrationFee: course.registration_fee ? (course.registration_fee / 100).toFixed(2) : prev.registrationFee,
      certificateLength: course.certification_length?.toString() || prev.certificateLength,
      registrationLimit: course.registration_limit?.toString() || prev.registrationLimit,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Update classType based on programmingOffering before submitting
      const updatedFormData: ClassFormData = {
        ...formData,
        classType: (formData.programmingOffering === 'Online Only' || formData.programmingOffering === 'Online + Skills Training') ? 'online' : 'in-person'
      };
      
      const result = onSubmit(updatedFormData);
      
      // If onSubmit returns a Promise, wait for it
      if (result instanceof Promise) {
        await result;
      }
      
      // If we get here without error, the parent should close the modal
      // If there's an error, it will be caught below
    } catch (error: any) {
      // Handle error - show it and remove overlay
      const errorMessage = error?.message || error?.toString() || 'Failed to create class';
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof ClassFormData, value: string | boolean | 'online' | 'in-person' | 'hybrid') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseChange = (courseId: string) => {
    updateField('courseId', courseId);
    const selected = [...programs, ...courses].find(c => c.id === courseId);
    if (selected) {
      inheritFieldsFromCourse(selected);
    }
  };

  // Determine label and options for dropdown
  const isEditMode = !!editingClass;
  const labelText = context === 'program' ? 'Program' : 'Course';
  // Derive isOnline from programmingOffering instead of classType dropdown
  const isOnline = formData.programmingOffering === 'Online Only' || formData.programmingOffering === 'Online + Skills Training';
  const shouldHideFields = formData.programmingOffering === 'Online Only' || formData.programmingOffering === 'Online + Skills Training';
  
  // Determine if registration fee should be hidden (for courses, not programs)
  const selectedCourse = formData.courseId ? [...programs, ...courses].find(c => c.id === formData.courseId) : null;
  const shouldHideRegistrationFee = selectedCourse?.program_type === 'course';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Class' : 'Create New Class'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Creating class...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait</p>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-medium">Error:</span>
                <span className="text-red-700">{submitError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className={`px-6 py-6 space-y-6 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
            {/* Course/Program Selection - Primary Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labelText} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  required
                  disabled={isEditMode || loadingData}
                  className={`w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm appearance-none transition-colors ${
                    isEditMode || loadingData
                      ? 'cursor-not-allowed bg-gray-100'
                      : 'cursor-pointer hover:border-gray-400 focus:outline-none focus:border-black focus:ring-black'
                  }`}
                >
                  <option value="">
                    {loadingData 
                      ? 'Loading...' 
                      : context === 'classes' 
                        ? 'Select a program or course...' 
                        : `Select a ${labelText.toLowerCase()}...`}
                  </option>
                  {context === 'classes' && programs.length > 0 && (
                    <optgroup label="Programs">
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.course_code} - {program.course_name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {context === 'classes' && courses.length > 0 && (
                    <optgroup label="Courses">
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_code} - {course.course_name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {context === 'program' && programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.course_code} - {program.course_name}
                    </option>
                  ))}
                  {context === 'course' && courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Programming Offering Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.programmingOffering}
                onChange={(e) => updateField('programmingOffering', e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black focus:ring-black"
              >
                <option value="">Select class type...</option>
                <option value="In Person Only">In Person Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Online + Skills Training">Online + Skills Training</option>
                <option value="In Person + Homework">In Person + Homework</option>
                <option value="Online Only">Online Only</option>
              </select>
            </div>

            {/* Price Badge Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                {isPriceEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-full">
                    <DollarSign size={12} className="text-gray-700" />
                    <input
                      ref={priceInputRef}
                      type="text"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      onBlur={() => setIsPriceEditing(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsPriceEditing(false);
                        }
                      }}
                      className="flex-1 text-[11px] font-medium text-gray-700 focus:outline-none bg-transparent"
                      placeholder="0.00"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPriceEditing(true)}
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-full"
                  >
                    <DollarSign size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.price || 'Price'}
                    </span>
                  </button>
                )}
              </div>

              {/* Registration Fee Badge Input */}
              {!shouldHideRegistrationFee && (
                <div className="relative flex-1">
                  {isRegistrationFeeEditing ? (
                    <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-full">
                      <DollarSign size={12} className="text-gray-700" />
                      <input
                        ref={registrationFeeInputRef}
                        type="text"
                        value={formData.registrationFee}
                        onChange={(e) => updateField('registrationFee', e.target.value)}
                        onBlur={() => setIsRegistrationFeeEditing(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsRegistrationFeeEditing(false);
                          }
                        }}
                        className="flex-1 text-[11px] font-medium text-gray-700 focus:outline-none bg-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRegistrationFeeEditing(true)}
                      className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-full"
                    >
                      <DollarSign size={12} className="text-gray-700" />
                      <span className="text-[11px] font-medium text-gray-700 truncate">
                        {formData.registrationFee || 'Reg Fee'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Certificate Length Badge Input */}
              <div className="relative flex-1">
                {isCertificateLengthEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-full">
                    <Award size={12} className="text-gray-700" />
                    <input
                      ref={certificateLengthInputRef}
                      type="text"
                      value={formData.certificateLength}
                      onChange={(e) => updateField('certificateLength', e.target.value)}
                      onBlur={() => setIsCertificateLengthEditing(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsCertificateLengthEditing(false);
                        }
                      }}
                      className="flex-1 text-[11px] font-medium text-gray-700 focus:outline-none bg-transparent"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCertificateLengthEditing(true)}
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-full"
                  >
                    <Award size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.certificateLength || 'Cert Length'}
                    </span>
                  </button>
                )}
              </div>

              {/* Registration Limit Badge Input */}
              {!shouldHideFields && (
                <div className="relative flex-1">
                  {isRegistrationLimitEditing ? (
                    <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-full">
                      <UserCheck size={12} className="text-gray-700" />
                      <input
                        ref={registrationLimitInputRef}
                        type="text"
                        value={formData.registrationLimit}
                        onChange={(e) => updateField('registrationLimit', e.target.value)}
                        onBlur={() => setIsRegistrationLimitEditing(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsRegistrationLimitEditing(false);
                          }
                        }}
                        className="flex-1 text-[11px] font-medium text-gray-700 focus:outline-none bg-transparent"
                        placeholder="0"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRegistrationLimitEditing(true)}
                      className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-full"
                    >
                      <UserCheck size={12} className="text-gray-700" />
                      <span className="text-[11px] font-medium text-gray-700 truncate">
                        {formData.registrationLimit || 'Reg Limit'}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Primary Details */}
            <div className="space-y-4">
              {!shouldHideFields && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Enrollment Open Date
                    </label>
                    <input
                      type="date"
                      value={formData.enrollmentOpenDate}
                      onChange={(e) => updateField('enrollmentOpenDate', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm transition-colors text-gray-900 bg-white focus:outline-none focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Enrollment Close Date
                    </label>
                    <input
                      type="date"
                      value={formData.enrollmentCloseDate}
                      onChange={(e) => updateField('enrollmentCloseDate', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm transition-colors text-gray-900 bg-white focus:outline-none focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Class Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.classStartDate}
                      onChange={(e) => updateField('classStartDate', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm transition-colors text-gray-900 bg-white focus:outline-none focus:border-black focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Class End Date
                    </label>
                    <input
                      type="date"
                      value={formData.classEndDate}
                      onChange={(e) => updateField('classEndDate', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md shadow-sm transition-colors text-gray-900 bg-white focus:outline-none focus:border-black focus:ring-black"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div>
              {isEditMode && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : (isEditMode ? 'Save Changes' : 'Create Class')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && editingClass && onDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-black mb-4">Delete Class</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{editingClass.class_name}</strong> ({editingClass.class_id})? 
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

