"use client";

import { useState, useRef, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { updateProfile } from "@/utils/api";
import useDebounce from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiUser, FiMapPin, FiGlobe, FiInfo, FiAtSign,FiSettings } from "react-icons/fi";
import CropModal from "@/components/profile/CropModal";

export default function SettingsPanel() {
  const { currentUser, mutateCurrentUser } = useUsers();
  const user = currentUser;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(user?.username || "");
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [sex, setSex] = useState(user?.sex || "other");
  const [accountPrivacy, setAccountPrivacy] = useState<"public" | "private">(user?.accountPrivacy || "public");

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
      await updateProfile({ user_avatar: url });

      await mutateCurrentUser();
    } catch {}
    setUploadingAvatar(false);
    setCropImageSrc(null);
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ user_avatar: "" });

      await mutateCurrentUser();
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
      await updateProfile({
        username,
        name,
        bio,
        location,
        sex,
        accountPrivacy,
      });

      await mutateCurrentUser();
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
    setAccountPrivacy(user.accountPrivacy || "public");

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
            p-3 md:p-6 pb-24 md:pb-6 rounded-2xl
            bg-right-nav-light dark:bg-right-nav-dark
            border border-[#d7d7d7] dark:border-white/10
            shadow-xl
            flex flex-col
            overflow-y-auto hide-scrollbar
        "
        >
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-dark dark:text-white mb-4 md:mb-6 flex items-center gap-2 flex-shrink-0">
          <FiSettings size={22} className="md:w-[26px] md:h-[26px]"/>Settings
        </h1>

        <div
          className="
            flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl mb-4
            bg-left-nav-light dark:bg-[#1f1f1f]
            border border-[#cfcfcf] dark:border-white/10
            cursor-pointer
            flex-shrink-0
          "
          onClick={() => setAvatarOptionsModal(true)}
        >
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#d0d0d0] dark:border-white/20 flex-shrink-0 aspect-square">
            <Image
              src={avatarSrc}
              fill
              alt="User Avatar"
              className="object-cover"
              unoptimized
            />

            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-primary-dark dark:text-white font-semibold text-base md:text-lg truncate">
              {user?.username}
            </p>
            <p className="text-[#606468] dark:text-white/60 text-xs md:text-sm truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-xs md:text-sm mb-1">
              <FiAtSign className="w-4 h-4" /> Username
            </label>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`
                w-full px-3 md:px-4 py-2 rounded-xl text-sm md:text-base
                bg-[#f3f3f3] dark:bg-[#262626]
                border text-primary-dark dark:text-white
                ${usernameError ? "border-red-500" : "border-[#cfcfcf] dark:border-white/10"}
                ${shakeUsername ? "shake" : ""}
              `}
            />

            {usernameError && (
              <p className="text-red-500 text-xs md:text-sm mt-1">{usernameError}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-xs md:text-sm mb-1">
              <FiUser className="w-4 h-4" /> Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full px-3 md:px-4 py-2 rounded-xl text-sm md:text-base
                bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-xs md:text-sm mb-1">
              <FiInfo className="w-4 h-4" /> Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="
                w-full px-3 md:px-4 py-2 md:py-3 rounded-xl resize-none text-sm md:text-base
                bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-xs md:text-sm mb-1">
              <FiMapPin className="w-4 h-4" /> Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="
                w-full px-3 md:px-4 py-2 rounded-xl text-sm md:text-base
                bg-[#f3f3f3] dark:bg-[#262626]
                border border-[#cfcfcf] dark:border-white/10
                text-primary-dark dark:text-white
              "
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-xs md:text-sm mb-1">
              <FiGlobe className="w-4 h-4" /> Gender
            </label>

            <select
              value={sex}
              onChange={(e) =>
                setSex(e.target.value as "male" | "female" | "other")
              }
              className="
                w-full px-3 md:px-4 py-2 rounded-xl text-sm md:text-base
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

          <div>
            <label className="flex items-center gap-2 text-primary-dark dark:text-white/90 text-xs md:text-sm mb-1">
              <FiGlobe className="w-4 h-4" /> Account Privacy
            </label>
            <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-[#f3f3f3] dark:bg-[#262626] border border-[#cfcfcf] dark:border-white/10">
              <span className="text-sm md:text-base text-primary-dark dark:text-white flex-1">
                {accountPrivacy === "public" ? "Public Account" : "Private Account"}
              </span>
              <button
                type="button"
                onClick={() => setAccountPrivacy(accountPrivacy === "public" ? "private" : "public")}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-200
                  ${accountPrivacy === "private" ? "bg-violet-600" : "bg-gray-400"}
                `}
              >
                <span
                  className={`
                    absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                    ${accountPrivacy === "private" ? "translate-x-6" : "translate-x-0"}
                  `}
                />
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {accountPrivacy === "public"
                ? "Anyone can view your links"
                : "Only users you're linked with can view your links"}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[#cfcfcf] dark:border-white/10 flex-shrink-0 bg-right-nav-light dark:bg-right-nav-dark -mx-3 md:-mx-6 px-3 md:px-6 pb-2 sticky bottom-0">
          <button
            onClick={handleSave}
            disabled={saving || !!usernameError}
            className={`
              w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base
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
                border border-white/20 p-4 md:p-6
                rounded-2xl w-[90%] max-w-80 backdrop-blur-xl mx-4
              "
            >
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 text-center">
                Profile Photo
              </h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setAvatarOptionsModal(false);
                    fileInputRef.current?.click();
                  }}
                  className="
                    w-full py-2.5 md:py-2 rounded-xl text-sm md:text-base
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
                  className="w-full py-2.5 md:py-2 rounded-xl bg-red-500 text-white font-semibold text-sm md:text-base"
                >
                  Remove Photo
                </button>

                <button
                  onClick={() => setAvatarOptionsModal(false)}
                  className="w-full py-2.5 md:py-2 rounded-xl bg-white/20 border border-white/20 text-white text-sm md:text-base"
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
