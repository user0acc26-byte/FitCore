import React from 'react';
import { IMAGE_PRESETS } from '../../lib/assets';
import { SafeImage } from '../common/SafeImage';

interface ImagePickerInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImagePickerInput({ label, value, onChange }: ImagePickerInputProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 350 * 1024) {
      // Compress via canvas if large so it fits cleanly within Firestore string limits
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 480;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            onChange(canvas.toDataURL('image/jpeg', 0.72));
          }
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[#858585]">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded overflow-hidden border border-white/10 shrink-0 bg-[#111111]">
          <SafeImage src={value} alt={label} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-2">
          <select
            value={IMAGE_PRESETS.some((p) => p.url === value) ? value : ''}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
            className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-xs text-white focus:outline-none focus:border-[#E51C2A]"
          >
            <option value="">Choose FitCore Visual Preset...</option>
            {IMAGE_PRESETS.map((p) => (
              <option key={p.url} value={p.url}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={value.startsWith('data:') ? '(Uploaded Image)' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/src/assets/images/... or https://..."
              className="flex-1 min-w-[160px] px-3 py-1.5 bg-[#111111] border border-white/15 rounded text-xs text-white focus:outline-none focus:border-[#E51C2A]"
            />
            <label className="px-3 py-1.5 bg-[#111111] hover:bg-white/10 border border-white/15 rounded text-xs text-white cursor-pointer whitespace-nowrap">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
