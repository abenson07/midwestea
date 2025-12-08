"use client";

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Monitor, Users, Building2, DollarSign, Percent, Award, UserCheck } from 'lucide-react';

interface CreateClassModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: ClassFormData) => void;
}

export interface ClassFormData {
  course: string;
  enrollmentOpenDate: string;
  enrollmentCloseDate: string;
  classStartDate: string;
  classEndDate: string;
  classType: 'online' | 'in-person' | 'hybrid';
  price: string;
  registrationFee: string;
  graduationRate: string;
  certificateLength: string;
  registrationLimit: string;
}

const courses = [
  'Web Development Bootcamp',
  'Data Science Fundamentals',
  'UX/UI Design Masterclass',
  'Machine Learning Advanced',
  'Mobile App Development',
  'Cloud Computing Essentials',
  'Cybersecurity Professional',
  'Digital Marketing Strategy',
  'Product Management',
  'DevOps Engineering'
];

export function CreateClassModal({ isOpen = true, onClose = () => {}, onSubmit = () => {} }: CreateClassModalProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    course: '',
    enrollmentOpenDate: '',
    enrollmentCloseDate: '',
    classStartDate: '',
    classEndDate: '',
    classType: 'in-person',
    price: '',
    registrationFee: '',
    graduationRate: '',
    certificateLength: '',
    registrationLimit: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPriceEditing, setIsPriceEditing] = useState(false);
  const [isRegistrationFeeEditing, setIsRegistrationFeeEditing] = useState(false);
  const [isGraduationRateEditing, setIsGraduationRateEditing] = useState(false);
  const [isCertificateLengthEditing, setIsCertificateLengthEditing] = useState(false);
  const [isRegistrationLimitEditing, setIsRegistrationLimitEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const registrationFeeInputRef = useRef<HTMLInputElement>(null);
  const graduationRateInputRef = useRef<HTMLInputElement>(null);
  const certificateLengthInputRef = useRef<HTMLInputElement>(null);
  const registrationLimitInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
    if (isGraduationRateEditing && graduationRateInputRef.current) {
      graduationRateInputRef.current.focus();
      graduationRateInputRef.current.select();
    }
  }, [isGraduationRateEditing]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof ClassFormData, value: string | boolean | 'online' | 'in-person' | 'hybrid') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const classTypeOptions = [
    { value: 'online' as const, label: 'Online', icon: Monitor },
    { value: 'in-person' as const, label: 'In Person', icon: Users },
    { value: 'hybrid' as const, label: 'Hybrid', icon: Building2 },
  ];

  const currentOption = classTypeOptions.find(opt => opt.value === formData.classType) || classTypeOptions[1];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Course Selection - Primary Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.course}
                  onChange={(e) => updateField('course', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm appearance-none cursor-pointer hover:border-gray-400 focus:outline-none focus:border-black focus:ring-black transition-colors"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Class Type Badge Dropdown and Price Badge */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  <CurrentIcon size={12} className="text-gray-700" />
                  <span className="text-[11px] font-medium text-gray-700">{currentOption.label}</span>
                  <ChevronDown size={12} className="text-gray-500" />
                </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[140px]">
                  {classTypeOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = formData.classType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          updateField('classType', option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-gray-600' : 'bg-gray-400'
                        }`} />
                        <OptionIcon size={12} className={isSelected ? 'text-gray-700' : 'text-gray-500'} />
                        <span>{option.label}</span>
                        {isSelected && (
                          <span className="ml-auto text-gray-600">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              </div>

              {/* Price Badge Input */}
              <div className="relative">
                {isPriceEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-[80px]">
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
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-[80px]"
                  >
                    <DollarSign size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.price || 'Price'}
                    </span>
                  </button>
                )}
              </div>

              {/* Registration Fee Badge Input */}
              <div className="relative">
                {isRegistrationFeeEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-[80px]">
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
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-[80px]"
                  >
                    <DollarSign size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.registrationFee || 'Reg Fee'}
                    </span>
                  </button>
                )}
              </div>

              {/* Graduation Rate Badge Input */}
              <div className="relative">
                {isGraduationRateEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-[80px]">
                    <Percent size={12} className="text-gray-700" />
                    <input
                      ref={graduationRateInputRef}
                      type="text"
                      value={formData.graduationRate}
                      onChange={(e) => updateField('graduationRate', e.target.value)}
                      onBlur={() => setIsGraduationRateEditing(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsGraduationRateEditing(false);
                        }
                      }}
                      className="flex-1 text-[11px] font-medium text-gray-700 focus:outline-none bg-transparent"
                      placeholder="0%"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsGraduationRateEditing(true)}
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-[80px]"
                  >
                    <Percent size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.graduationRate ? `${formData.graduationRate}%` : 'Grad Rate'}
                    </span>
                  </button>
                )}
              </div>

              {/* Certificate Length Badge Input */}
              <div className="relative">
                {isCertificateLengthEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-[80px]">
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
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-[80px]"
                  >
                    <Award size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.certificateLength || 'Cert Length'}
                    </span>
                  </button>
                )}
              </div>

              {/* Registration Limit Badge Input */}
              <div className="relative">
                {isRegistrationLimitEditing ? (
                  <div className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white ring-2 ring-transparent focus-within:ring-black w-[80px]">
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
                    className="flex items-center gap-1.5 px-1 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors w-[80px]"
                  >
                    <UserCheck size={12} className="text-gray-700" />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {formData.registrationLimit || 'Reg Limit'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Primary Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Open Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.enrollmentOpenDate}
                    onChange={(e) => updateField('enrollmentOpenDate', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Close Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.enrollmentCloseDate}
                    onChange={(e) => updateField('enrollmentCloseDate', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.classStartDate}
                    onChange={(e) => updateField('classStartDate', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.classEndDate}
                    onChange={(e) => updateField('classEndDate', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black focus:ring-black transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
            >
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

