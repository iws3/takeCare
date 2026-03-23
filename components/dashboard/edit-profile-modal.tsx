"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, User, Image as ImageIcon, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/medical";
import Image from "next/image";


interface EditProfileModalProps {
  user: {
    clerkId: string;
    name: string | null;
    avatarUrl: string | null;
    coverImageUrl: string | null;
  };
  onUpdate: () => void;
}

export function EditProfileModal({ user, onUpdate }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    avatarUrl: user.avatarUrl || "",
    coverImageUrl: user.coverImageUrl || "",
  });

  const handleUpdate = async () => {
    if (!formData.name) {
       alert("Name is required.");
       return;
    }
    setLoading(true);
    try {
      await updateProfile(user.clerkId, formData);
      onUpdate();
    } catch (error) {
       console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" className="rounded-2xl border-black/5 bg-black/5 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all px-8 h-12 shadow-sm">
            Edit Profile
          </Button>
        }
      />

      <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-white border-black/5 p-8 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-bricolage text-3xl font-extrabold tracking-tighter">Edit Patient Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Cover Image URL</Label>
            <div className="relative group rounded-3xl overflow-hidden h-32 bg-black/5 border border-black/5">
              {formData.coverImageUrl && (
                <Image src={formData.coverImageUrl} alt="Cover" fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="text-white h-8 w-8" />
              </div>
              <Input
                placeholder="https://..."
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                className="absolute bottom-2 left-2 right-2 h-10 bg-white/90 border-none rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Avatar and Name */}
          <div className="flex gap-6 items-start">
             <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Avatar</Label>
                <div className="relative h-24 w-24 rounded-3xl bg-primary/10 border-4 border-white shadow-xl overflow-hidden group">
                   {formData.avatarUrl ? (
                     <Image src={formData.avatarUrl} alt="Avatar" fill className="object-cover" />
                   ) : (
                     <User className="h-full w-full p-4 text-primary/40" />
                   )}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white h-5 w-5" />
                   </div>
                </div>
                <Input
                  placeholder="URL..."
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="mt-2 h-10 bg-black/5 border-none rounded-xl text-[10px] font-bold"
                />
             </div>

             <div className="flex-1 space-y-4">
               <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Full Name</Label>
                 <Input
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="h-14 rounded-2xl border-black/5 bg-black/5 px-6 text-lg font-bold focus:bg-white"
                 />
               </div>
             </div>
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={loading}
            className="w-full h-14 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black/90 shadow-xl shadow-black/10"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Save Profile Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
