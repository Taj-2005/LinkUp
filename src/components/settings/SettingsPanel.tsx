"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { updateProfile } from "@/utils/api";
import useDebounce from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiUser, FiMapPin, FiGlobe, FiInfo, FiAtSign,FiSettings } from "react-icons/fi";
import CropModal from "@/components/profile/CropModal";

export default function SettingsPanel() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(user?.username || "");
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [sex, setSex] = useState(user?.sex || "other");

  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [shakeUsername, setShakeUsername] = useState(false);

  const debouncedUsername = useDebounce(username, 600);

  const [avatarOptionsModal, setAvatarOptionsModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const uploadToCloudinary = async (file: File) => {
    const dataUrl = await fileToDataURL(file);

    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: dataUrl }),
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.secure_url;
  };

  const handleSelectAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadingAvatar(true);
    if (!file) return;

    const data = await fileToDataURL(file);
    setCropImageSrc(data);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropDone = async (url: string) => {
    try {
      const updated = await updateProfile({ user_avatar: url });
      setUser(updated.user);
    } catch {}
    setUploadingAvatar(false);
    setCropImageSrc(null);
  };

  const handleRemoveAvatar = async () => {
    try {
      const updated = await updateProfile({ user_avatar: "" });
      setUser(updated.user);
    } catch {}
  };

  const checkUsername = async (value: string) => {
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
      } else {
        setUsernameError("");
      }
    } catch {}
  };

  if (debouncedUsername && debouncedUsername !== user?.username) {
    checkUsername(debouncedUsername);
  }

  const handleSave = async () => {
    if (usernameError) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        username,
        name,
        bio,
        location,
        sex,
      });
      setUser(updated.user);
    } catch {}
    setSaving(false);
  };

  const avatarSrc = user?.user_avatar || "/light-profile.png";

  useEffect(() => {
    if (!user) return;

    setUsername(user.username || "");
    setName(user.name || "");
    setBio(user.bio || "");
    setLocation(user.location || "");
    setSex(user.sex || "other");

    }, [user]);

  return (
    <>
        <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="
            w-full max-w-3xl
            h-full
            p-6 rounded-2xl 
            bg-right-nav-light dark:bg-right-nav-dark
            border border-[#d7d7d7] dark:border-white/10
            shadow-xl
            flex flex-col    
            overflow-hidden
        "
        >
        <h1 className="text-3xl font-extrabold text-primary-dark dark:text-white mb-6 flex items-center gap-2">
          <FiSettings size={26}/>Settings
        </h1>

        <div
          className="
            flex items-center gap-4 p-4 rounded-xl mb-4
            bg-left-nav-light dark:bg-[#1f1f1f]
            border border-[#cfcfcf] dark:border-white/10
            cursor-pointer
          "
          onClick={() => setAvatarOptionsModal(true)}
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#d0d0d0] dark:border-white/20">
            <Image
              src={avatarSrc}
              fill
              alt="User Avatar"
              className="object-cover"
              unoptimized
            />

            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
              </div>
            )}
          </div>

          <div>
            <p className="text-primary-dark dark:text-white font-semibold text-lg">
              {user?.username}
            </p>
            <p className="text-[#606468] dark:text-white/60 text-sm">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-sm mb-1">
              <FiAtSign /> Username
            </label>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`
                w-full px-4 py-2 rounded-xl
                bg-[#f3f3f3] dark:bg-[#262626]
                border text-primary-dark dark:text-white
                ${usernameError ? "border-red-500" : "border-[#cfcfcf] dark:border-white/10"}
                ${shakeUsername ? "shake" : ""}
              `}
            />

            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-sm mb-1">
              <FiUser /> Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full px-4 py-2 rounded-xl bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-sm mb-1">
              <FiInfo /> Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl resize-none
                bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-sm mb-1">
              <FiMapPin /> Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="
                w-full px-4 py-2 rounded-xl
                bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-sm mb-1">
              <FiGlobe /> Gender
            </label>

            <select
              value={sex}
              onChange={(e) =>
                setSex(e.target.value as "male" | "female" | "other")
              }
              className="
                w-full px-4 py-2 rounded-xl
                bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            >
              <option value="male" className="bg-right-nav-light dark:bg-right-nav-dark">Male</option>
              <option value="female" className="bg-right-nav-light dark:bg-right-nav-dark">Female</option>
              <option value="other" className="bg-right-nav-light dark:bg-right-nav-dark">Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={saving || !!usernameError}
            className={`
              px-8 py-3 rounded-2xl font-semibold 
              bg-primary-light text-white dark:bg-primary-dark dark:text-white
              hover:brightness-110 shadow-lg transition
              ${(saving || usernameError) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {avatarOptionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              className="
                bg-white/10 dark:bg-black/20 
                border border-white/20 p-6 
                rounded-2xl w-80 backdrop-blur-xl
              "
            >
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Profile Photo
              </h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setAvatarOptionsModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="
                    w-full py-2 rounded-xl 
                    bg-primary-light text-black
                    dark:bg-primary-dark dark:text-white 
                    font-semibold
                  "
                >
                  Change Photo
                </button>

                <button
                  onClick={async () => {
                    await handleRemoveAvatar();
                    setAvatarOptionsModal(false);
                  }}
                  className="w-full py-2 rounded-xl bg-red-500 text-white font-semibold"
                >
                  Remove Photo
                </button>

                <button
                  onClick={() => setAvatarOptionsModal(false)}
                  className="w-full py-2 rounded-xl bg-white/20 border border-white/20 text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          uploadToCloudinary={uploadToCloudinary}
          onCropDone={handleCropDone}
          onClose={() => {
            setCropImageSrc(null);
            setUploadingAvatar(false);
          }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleSelectAvatar}
      />
    </>
  );
}
