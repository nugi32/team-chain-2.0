"use client";

import React, { useRef, useState } from "react";
import FieldHint from "./FieldHint";
import Label from "./Label";
import LinkRow from "./LinkRow";
import type { Milestone } from "./types";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Info, Link as LinkIcon, Paperclip, Plus, Send, Star, Upload, X } from "lucide-react";

interface SubmissionFormProps {
  milestones: Milestone[];
  requiredDocs: string[];
  onSubmitSuccess: (milestoneNum: number) => void;
}

export default function SubmissionForm({ milestones, requiredDocs, onSubmitSuccess }: SubmissionFormProps) {
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [selfRating, setSelfRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [requestReview, setRequestReview] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped].slice(0, 5));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const picked = Array.from(e.target.files);
      setFiles(prev => [...prev, ...picked].slice(0, 5));
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmitSuccess(activeMilestone + 1);
    }, 2000);
  };

  const canSubmit = notes.trim().length > 20 && links[0].length > 4;

  return (
    <div className="space-y-5">
      {/* Milestone selector */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Which milestone are you submitting for?</h2>
        <div className="space-y-2">
          {milestones.map((m, i) => (
            <button
              key={i}
              onClick={() => !m.done && setActiveMilestone(i)}
              disabled={m.done}
              className={`w-full flex items-center gap-3 rounded-xl border p-3.5 transition-colors text-left ${
                m.done
                  ? "border-gray-800 opacity-40 cursor-not-allowed"
                  : activeMilestone === i
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                  m.done
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : activeMilestone === i
                      ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                      : "border-gray-600 text-gray-500"
                }`}
              >
                {m.done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={`flex-1 text-xs ${m.done ? "text-gray-600" : activeMilestone === i ? "text-white font-medium" : "text-gray-400"}`}
              >
                {m.label}
              </span>
              <span className={`text-[10px] font-semibold flex-shrink-0 ${m.done ? "text-gray-600" : "text-gray-500"}`}>
                {m.pct}%
              </span>
              {m.done && (
                <span className="text-[9px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-1.5 py-0.5">
                  Done
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress notes */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <Label>Progress Notes *</Label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={5}
          placeholder={`Describe what you've built for Milestone ${activeMilestone + 1}.\n\nInclude: what was implemented, any blockers encountered, deviations from spec, and what's ready for review.`}
          className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/60 transition-colors resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1">
          <FieldHint>Min 20 characters. Be specific — reviewers use this to evaluate.</FieldHint>
          <span className={`text-[10px] ${notes.length >= 20 ? "text-emerald-500" : "text-gray-600"}`}>
            {notes.length} chars
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <Label>Deliverable Links *</Label>
          {links.length < 4 && (
            <button
              onClick={() => setLinks(prev => [...prev, ""])}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add link
            </button>
          )}
        </div>
        <div className="space-y-2">
          {links.map((l, i) => (
            <LinkRow
              key={i}
              value={l}
              onChange={v => setLinks(prev => prev.map((x, idx) => (idx === i ? v : x)))}
              placeholder={
                i === 0
                  ? "https://github.com/yourrepo/dao-portal"
                  : i === 1
                    ? "https://loom.com/share/screen-recording…"
                    : "https://…"
              }
              onRemove={() => setLinks(prev => prev.filter((_, idx) => idx !== i))}
              showRemove={links.length > 1}
            />
          ))}
        </div>
        <FieldHint>GitHub, Loom, Figma, or any relevant URL. First link is primary.</FieldHint>
      </div>

      {/* File attachments */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <Label>Attachments (optional)</Label>
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-gray-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
        >
          <Upload className="w-6 h-6 text-gray-600 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
          <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
            Drag & drop files, or click to browse
          </p>
          <p className="text-[10px] text-gray-600 mt-1">PDF, PNG, ZIP — max 5 files, 10MB each</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.zip,.md"
        />
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2"
              >
                <Paperclip className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="flex-1 text-xs text-gray-300 truncate">{f.name}</span>
                <span className="text-[10px] text-gray-500">{(f.size / 1024).toFixed(0)}KB</span>
                <button
                  onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Self assessment */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <Label>Self-Assessment</Label>
        <p className="text-[11px] text-gray-500 mb-3">
          How confident are you in this submission? This helps reviewers calibrate.
        </p>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setSelfRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || selfRating) ? "text-amber-400 fill-amber-400" : "text-gray-700"
                }`}
              />
            </button>
          ))}
        </div>
        {selfRating > 0 && (
          <p className="text-[11px] text-gray-400">
            {["", "Needs work", "Mostly done", "Good shape", "Solid", "Production ready"][selfRating]}
          </p>
        )}
      </div>

      {/* Review option */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setRequestReview(!requestReview)}
            className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              requestReview ? "bg-indigo-500 border-indigo-500" : "border-gray-600"
            }`}
          >
            {requestReview && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-200">Request peer review now</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Assigned reviewers will be notified immediately. If unchecked, you can trigger review later from your
              dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        {!canSubmit && (
          <div className="flex items-center gap-2 mb-4 text-[11px] text-amber-400">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Fill in progress notes (20+ chars) and at least one link to enable submission.
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Milestone {activeMilestone + 1}
              {requestReview && " & Request Review"}
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-600 text-center mt-2">
          This action is recorded on-chain and notifies reviewers.
        </p>
      </div>
    </div>
  );
}
