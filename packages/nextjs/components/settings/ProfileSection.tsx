"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, Trash2, X, User } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Field from "./Field";
import Input from "./Input";
import Textarea from "./Textarea";
import SaveBar from "./SaveBar";

export default function ProfileSection() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("jdoe_eth");
  const [displayName, setDisplayName] = useState("John Doe");
  const [bio, setBio] = useState("Smart contract developer & DAO contributor. Building on-chain collaboration tools.");
  const [location, setLocation] = useState("San Francisco, CA");
  const [website, setWebsite] = useState("https://johndoe.dev");
  const [github, setGithub] = useState("jdoe");
  const [twitter, setTwitter] = useState("jdoe_eth");
  const [skills, setSkills] = useState(["Solidity", "React", "Ethers.js", "Hardhat"]);
  const [skillInput, setSkillInput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutate = (fn: () => void) => { fn(); setDirty(true); };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
    setDirty(true);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    mutate(() => setSkills((p) => [...p, s]));
    setSkillInput("");
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setDirty(false);
  };

  return (
    <div>
      <SectionHeading icon={<User className="w-3.5 h-3.5" />} label="Profile" />

      {/* Avatar */}
      <div className="flex items-start gap-5 mb-8 pb-8 border-b border-gray-800">
        <div className="relative group flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl border-2 border-gray-800 overflow-hidden bg-gray-900 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-indigo-300">JD</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-300 mb-1">Profile picture</p>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            Recommended: 400×400px. JPG, PNG, or GIF. Max 2MB.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-700 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Upload className="w-3 h-3" /> Upload
            </button>
            {avatar && (
              <button
                onClick={() => { setAvatar(null); setDirty(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 hover:border-red-500/40 text-xs text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Field label="Username" hint="Unique identifier on-chain. Changing costs a small gas fee.">
          <Input value={username} onChange={(v) => mutate(() => setUsername(v))} prefix="@" maxLength={30} />
        </Field>
        <Field label="Display name">
          <Input value={displayName} onChange={(v) => mutate(() => setDisplayName(v))} maxLength={50} />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Bio" hint="Visible on your public profile and task applications.">
          <Textarea
            value={bio}
            onChange={(v) => mutate(() => setBio(v))}
            placeholder="Tell teams about yourself…"
            rows={3}
            maxLength={280}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 pb-8 border-b border-gray-800">
        <Field label="Location">
          <Input value={location} onChange={(v) => mutate(() => setLocation(v))} placeholder="City, Country" />
        </Field>
        <Field label="Website">
          <Input value={website} onChange={(v) => mutate(() => setWebsite(v))} placeholder="https://…" />
        </Field>
        <Field label="Github">
          <Input value={github} onChange={(v) => mutate(() => setGithub(v))} prefix="github.com/" />
        </Field>
        <Field label="Twitter / X">
          <Input value={twitter} onChange={(v) => mutate(() => setTwitter(v))} prefix="@" />
        </Field>
      </div>

      {/* Skills */}
      <div className="mb-2">
        <Field label="Skills" hint="Added to your on-chain profile and used for task matching.">
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill…"
              className="flex-1 rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none transition-colors"
            />
            <button
              onClick={addSkill}
              className="px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900 hover:border-indigo-500/40 text-xs text-gray-400 hover:text-indigo-400 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-[11px] text-gray-300"
              >
                {s}
                <button
                  onClick={() => mutate(() => setSkills((p) => p.filter((x) => x !== s)))}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </Field>
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}