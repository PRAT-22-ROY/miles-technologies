import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  options?: string[];
  multiple?: boolean;
}

interface AdvancedFormModalProps {
  title: string;
  fields: Field[];
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

export const AdvancedFormModal: React.FC<AdvancedFormModalProps> = ({
  title,
  fields,
  onSubmit,
  onClose,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleCheckboxChange = (
    groupName: string,
    option: string,
    checked: boolean,
  ) => {
    setFormData((prev: any) => {
      const currentGroup = prev[groupName] || [];
      if (checked) {
        return { ...prev, [groupName]: [...currentGroup, option] };
      } else {
        return {
          ...prev,
          [groupName]: currentGroup.filter((item: string) => item !== option),
        };
      }
    });
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#121214] border border-purple-500/20 p-6 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black text-xl">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={formData[f.name] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [f.name]: e.target.value })
                  }
                >
                  <option value="">Select...</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "checkbox-group" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-black/30 border border-white/5 rounded-xl">
                  {f.options?.map((o) => (
                    <label
                      key={o}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={(formData[f.name] || []).includes(o)}
                        onChange={(e) =>
                          handleCheckboxChange(f.name, o, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-white/10 bg-black/50 text-purple-500 focus:ring-purple-500"
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type={f.type || "text"}
                  required={f.type !== "file"}
                  placeholder={f.placeholder}
                  value={f.type !== "file" ? formData[f.name] || "" : undefined}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [f.name]:
                        f.type === "file"
                          ? (e.target as any).files[0]
                          : e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 !bg-purple-600 hover:!bg-purple-500 text-white shadow-none border-0"
            >
              Save
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
