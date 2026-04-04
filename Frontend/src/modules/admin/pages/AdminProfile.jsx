import { useState } from "react";
import {
  ShieldCheck,
  User,
  MapPin,
  Pencil,
  Building2,
} from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import useProfile from "../hooks/useProfile";

// ─── InfoField ─────────────────────────────────────────────────────────────────
function InfoField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-base font-medium text-gray-900 dark:text-slate-100">
        {value || "-"}
      </span>
    </div>
  );
}

// ─── FieldGrid ─────────────────────────────────────────────────────────────────
function FieldGrid({ fields }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
      {fields.map((f) => (
        <InfoField key={f.label} label={f.label} value={f.value} />
      ))}
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "company", label: "Company Details", icon: Building2 },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState("personal");

  // Fetch profile
  const { profile, loading, error, updateProfile, changePassword } = useProfile();

  // ── Modal state ──
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleChangePasswordClick = () => {
    setIsEditModalOpen(false);
    setIsPasswordModalOpen(true);
  };

  //  Loading state
  if (loading) {
    return (
      <div className="p-6 text-gray-500 dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  //  Error state
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  //  Map backend → UI fields
  const PERSONAL_FIELDS = [
    { label: "Name", value: profile?.name },
    { label: "Password", value: "xxxxxxxxx" },
    { label: "Mobile Number", value: profile?.phone },
    { label: "Email Address", value: profile?.email },
    { label: "Designation", value: profile?.designation },
    { label: "Department", value: profile?.department },
  ];

  const COMPANY_FIELDS = [
    { label: "Company Name", value: profile?.companyName || "-" },
    { label: "Role", value: profile?.roleName || "-" },
  ];

  return (
    <div className="h-full w-full animate-fade-up">
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 sm:p-8 h-full">

        {/* ─── Top row ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          {/* Name & meta */}
          <div className="flex flex-col gap-2">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {profile?.name?.[0] || "U"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
                {profile?.name}
              </h2>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-1.5 sm:pl-15 mt-1">
              <div className="flex items-center gap-2 text-base text-gray-500 dark:text-slate-400">
                <ShieldCheck size={15} />
                <span>{profile?.roleName || "User"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                <User size={15} />
                <span>User ID: {profile?.id}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                <MapPin size={15} />
                <span>{profile?.companyName || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="self-start flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 dark:border-slate-700 mb-6 animate-fade-up-2">
          <div className="flex gap-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-base font-medium transition-colors cursor-pointer
                  ${
                    activeTab === id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  }
                `}
              >
                <Icon size={15} />
                {label}
                <span
                  className={`absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 transition-transform duration-200 origin-left
                    ${activeTab === id ? "scale-x-100" : "scale-x-0"}
                  `}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div className="animate-fade-up-3">
          {activeTab === "personal" && <FieldGrid fields={PERSONAL_FIELDS} />}
          {activeTab === "company" && <FieldGrid fields={COMPANY_FIELDS} />}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onChangePasswordClick={handleChangePasswordClick}
        profile={profile}
        onSave={updateProfile}
      />

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={changePassword}
      />
    </div>
  );
}