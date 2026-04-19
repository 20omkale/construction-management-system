// src/shared/constants/appConstants.js

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  EMPLOYEE: 'EMPLOYEE',
};

export const DPR_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',     // Used when Rejected/Needs Changes
  COMPLETED: 'COMPLETED', // Used when Approved
};

export const COMPANY_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
};

// UI Helpers for mapping statuses to colors
export const STATUS_BADGES = {
  [DPR_STATUS.COMPLETED]: { label: 'Approved', bg: 'bg-[#00A86B]', text: 'text-white' },
  [DPR_STATUS.REVIEW]: { label: 'Rejected', bg: 'bg-[#EF4444]', text: 'text-white' },
  [DPR_STATUS.TODO]: { label: 'Submitted', bg: 'bg-[#0f62fe]', text: 'text-white' },
};