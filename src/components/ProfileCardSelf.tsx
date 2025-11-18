"use client";

import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import { IUser } from "@/models/User";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import useDebounce from "@/hooks/useDebounce";
import { updateProfile, getCurrentUser } from "@/utils/api";
import ProfileNavbarSelf from "@/components/profile/ProfileNavbarSelf";

// ✅ Import your ready CropModal
import CropModal from "@/components/profile/CropModal";

type UpdateProfilePayload = Partial<{
  username: string;
  name: string;
  bio: string;
  location: string;
  user_avatar: string;
}>;

export default function ProfileCard() {
  const { resolvedTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<IUser | null>(null);
  const [displayUser, setDisplayUser] = useState<IUser | null>(null);
  const [fetchDone, setFetchDone] = useState(false);

  // avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 👉 external crop modal
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // edit states
  const [editModal, setEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // profile fields
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [fullName, setFullName] = useState("");

  // validation
  const [usernameError, setUsernameError] = useState("");
  const [shakeUsername, setShakeUsername] = useState(false);
  const [nameError, setNameError] = useState("");
  const [shakeName, setShakeName] = useState(false);

  const debouncedUsername = useDebounce(username, 600);

  /* =========================================================
     FETCH INITIAL USER
  ========================================================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setFetchDone(true);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (fetchDone) setDisplayUser(user);
  }, [fetchDone, user]);

  /* =========================================================
     VALIDATIONS
  ========================================================= */

  const validateName = (value: string) => {
    const words = value.trim().split(/\s+/).filter(Boolean);

    if (words.length > 2) {
      setNameError("Only first name and last name allowed");
      setShakeName(true);
      setTimeout(() => setShakeName(false), 400);
      setFullName(words.slice(0, 2).join(" "));
      return;
    }

    setNameError("");
    setFullName(value);
  };

  const checkUsername = async (value: string) => {
    if (!value.trim()) return;

    try {
      const res = await fetch("/api/auth/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });

      const data = await res.json();

      if (data.exists) {
        setUsernameError("Username already taken");
        setShakeUsername(true);
        setTimeout(() => setShakeUsername(false), 400);
      } else setUsernameError("");
    } catch {}
  };

  useEffect(() => {
    if (!debouncedUsername.trim()) return;

    if (debouncedUsername === displayUser?.username) {
      setUsernameError("");
      return;
    }

    checkUsername(debouncedUsername);
  }, [debouncedUsername, displayUser?.username]);

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */
  const openEditModal = () => {
    setUsername(displayUser?.username ?? "");
    setFullName(displayUser?.name ?? "");
    setBio(displayUser?.bio ?? "");
    setLocation(displayUser?.location ?? "");

    setAvatarPreview(null);
    setTempAvatar(null);

    setEditMode(true);
    setEditModal(true);
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */
  const handleEditSave = async () => {
    if (!editMode) return;
    if (usernameError || nameError) return;

    const changed: UpdateProfilePayload = {};

    if (username !== displayUser?.username) changed.username = username;
    if (fullName !== displayUser?.name) changed.name = fullName;
    if (bio !== displayUser?.bio) changed.bio = bio;
    if (location !== displayUser?.location) changed.location = location;

    if (tempAvatar && tempAvatar !== displayUser?.user_avatar)
      changed.user_avatar = tempAvatar;

    try {
      if (Object.keys(changed).length > 0) {
        const result = await updateProfile(changed);
        setDisplayUser(result.user);
      }

      setEditModal(false);
      setEditMode(false);
      setTempAvatar(null);
      setAvatarPreview(null);

      window.location.reload();
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const handleCancel = () => {
    setEditModal(false);
    setEditMode(false);
    setAvatarPreview(null);
    setTempAvatar(null);
    setUsernameError("");
    setNameError("");
  };

  const isSaveDisabled = !!usernameError || !!nameError || !username.trim();

  /* =========================================================
     CLOUDINARY UPLOAD (your existing implementation)
  ========================================================= */
  const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadToCloudinary = async (file: File) => {
    const dataUrl = await fileToDataURL(file);

    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: dataUrl }),
    });

    if (!res.ok) throw new Error("Cloudinary upload failed");

    const data = await res.json();
    return data.secure_url;
  };

  /* =========================================================
      FILE SELECT → open CropModal
  ========================================================= */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataURL(file);
    setCropImageSrc(dataUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* =========================================================
      DRAG & DROP → open CropModal
  ========================================================= */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataURL(file);
    setCropImageSrc(dataUrl);
  };

  /* =========================================================
      WHEN CROPPING DONE → Update preview + tempAvatar
  ========================================================= */
  const handleCropDone = (url: string) => {
    setAvatarPreview(url);
    setTempAvatar(url);
    setCropImageSrc(null);
  };

  if (!fetchDone || !displayUser) {
    return (
      <div className="w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center md:items-start gap-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-primary-light dark:border-primary-dark bg-gray-300 dark:bg-gray-700"
          >
            <div className="absolute inset-0 animate-shimmer opacity-60" />
          </motion.div>
          <div className="flex-1 flex flex-col justify-between w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 space-y-3"
            >
              <div className="relative h-7 w-48 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>
              <div className="relative h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>
            </motion.div>
            <div className="flex gap-8 text-center mb-6">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="space-y-2"
                >
                  <div className="relative h-7 w-10 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer opacity-60" />
                  </div>
                  <div className="relative h-4 w-14 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer opacity-60" />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-3 max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-md" />
                <div className="relative h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer opacity-60" />
                </div>
              </motion.div>
              {[100, 80, 60].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                  className="relative h-4 bg-gray-300 dark:bg-gray-700 rounded-md overflow-hidden"
                  style={{ width: `${w}%` }}
                >
                  <div className="absolute inset-0 animate-shimmer opacity-60" />
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-4"
            >
              <div className="relative h-10 w-36 bg-gray-300 dark:bg-gray-700 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* =========================================================
      AVATAR DISPLAY FINAL
  ========================================================= */
  const avatarSrc =
    avatarPreview ??
    tempAvatar ??
    displayUser.user_avatar ??
    (resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png");

  /* =========================================================
      RETURN JSX
  ========================================================= */

  return (
    <>
      {/* Main Profile */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-xl border-4">
          <Image src={avatarSrc} alt="User Avatar" fill className="object-cover" />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-white">
            {displayUser.username}
          </h1>

          <p className="text-primary-light dark:text-primary-light/80 text-lg font-semibold mt-1">
            {displayUser.name}
          </p>

          <div className="mt-5 max-w-lg">
            <div className="flex items-center gap-2 text-primary-light dark:text-white text-sm">
              <FiMapPin className="text-xl" />
              {displayUser.location}
            </div>

            <p className="text-primary-light dark:text-white mt-2 leading-relaxed">
              {displayUser.bio}
            </p>
          </div>

          <button
            onClick={openEditModal}
            className="mt-4 bg-primary-light dark:bg-primary-dark px-6 py-2 rounded-2xl text-black dark:text-white"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <ProfileNavbarSelf />

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-xl bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.6 }}
              className="w-[92%] max-w-2xl rounded-3xl p-[2px] bg-gradient-to-br from-white/20 to-white/5 shadow-xl"
            >
              <div className="rounded-3xl p-8 bg-white/10 dark:bg-black/20 border border-white/20">

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-6">Edit Profile</h2>

                {/* Header Avatar */}
                <div className="flex items-center justify-between mb-8 bg-white/10 dark:bg-black/20 p-4 rounded-2xl border border-white/20 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/40">
                      <Image src={avatarSrc} fill alt="Avatar" className="object-cover" />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-white font-semibold text-lg">{displayUser.username}</p>
                      <p className="text-white/70 text-sm">{displayUser.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2 rounded-xl bg-primary-light text-black dark:bg-primary-dark dark:text-white font-semibold"
                  >
                    Change photo
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Drag & Drop */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="hidden md:flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl p-6 mb-8 bg-white/5 text-white/70"
                >
                  <p>Drag & drop a photo here</p>
                  <p className="text-xs opacity-60">(Desktop only)</p>
                </div>

                {/* Username */}
                <div className="mb-5">
                  <label className="text-sm text-white/90">Username</label>
                  <input
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.trim()) {
                        setUsernameError("Username cannot be empty");
                        setShakeUsername(true);
                        setTimeout(() => setShakeUsername(false), 400);
                      } else setUsernameError("");
                      setUsername(val);
                    }}
                    className={`w-full px-4 py-2 mt-1 rounded-xl bg-white/20 border text-white ${
                      usernameError ? "border-red-500" : "border-white/30"
                    } ${shakeUsername ? "shake" : ""}`}
                  />
                  {usernameError && <p className="text-red-400 text-sm">{usernameError}</p>}
                </div>

                {/* Full Name */}
                <div className="mb-5">
                  <label className="text-sm text-white/90">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => validateName(e.target.value)}
                    className={`w-full px-4 py-2 mt-1 rounded-xl bg-white/20 border text-white ${
                      nameError ? "border-red-500" : "border-white/30"
                    } ${shakeName ? "shake" : ""}`}
                  />
                  {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
                </div>

                {/* Location */}
                <div className="mb-5">
                  <label className="text-sm text-white/90">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 mt-1 rounded-xl bg-white/20 border border-white/30 text-white"
                  />
                </div>

                {/* Bio */}
                <div className="mb-8">
                  <label className="text-sm text-white/90">Bio</label>
                  <textarea
                    value={bio}
                    rows={4}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 mt-1 rounded-xl bg-white/20 border border-white/30 text-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2 rounded-xl text-black dark:text-white bg-white/20 border border-white/20"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleEditSave}
                    disabled={isSaveDisabled}
                    className={`px-6 py-2 rounded-xl font-semibold bg-primary-light text-black dark:bg-primary-dark dark:text-white ${
                      isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CROPPING MODAL */}
      {cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          uploadToCloudinary={uploadToCloudinary}
          onCropDone={handleCropDone}
        />
      )}
    </>
  );
}
