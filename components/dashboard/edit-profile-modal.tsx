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

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "avatarUrl" | "coverImageUrl") => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB for demo/Base64 efficiency)
      if (file.size > 2 * 1024 * 1024) {
         alert("Image is too large. Please select an image under 2MB.");
         return;
      }
      const reader = new FileReader();
      reader.onloadstart = () => setLoading(true);
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
        setLoading(false);
      };
      reader.onerror = () => {
        alert("Failed to read file.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };


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


  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Cover Image</Label>
            <div 
              className="relative group rounded-3xl overflow-hidden h-32 bg-black/5 border border-black/5 cursor-pointer"
              onClick={() => coverInputRef.current?.click()}
            >
              <input 
                ref={coverInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "coverImageUrl")}
              />
              {formData.coverImageUrl && (isValidUrl(formData.coverImageUrl) || formData.coverImageUrl.startsWith("data:")) && (
                <img src={formData.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="text-white h-8 w-8" />
                <span className="text-[10px] text-white font-black uppercase mt-2">Click to Upload</span>
              </div>
            </div>
          </div>

          {/* Avatar and Name */}
          <div className="flex gap-6 items-start">
             <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Avatar</Label>
                <div 
                  className="relative h-24 w-24 rounded-3xl bg-primary/10 border-4 border-white shadow-xl overflow-hidden group cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                   <input 
                      ref={avatarInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "avatarUrl")}
                   />
                   {formData.avatarUrl && (isValidUrl(formData.avatarUrl) || formData.avatarUrl.startsWith("data:")) ? (
                     <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-full w-full p-4 text-primary/40" />
                   )}
                   <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <Camera className="text-white h-5 w-5" />
                      <span className="text-[8px] text-white font-black uppercase mt-1">Upload</span>
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
