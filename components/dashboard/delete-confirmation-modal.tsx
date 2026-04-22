"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}: DeleteConfirmationModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Deletion failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[3rem] bg-white p-12 md:p-16 border border-black/5 shadow-2xl overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <DialogHeader className="items-center text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-red-500/10 rounded-3xl animate-pulse" />
            <AlertTriangle className="h-10 w-10 text-red-500 relative z-10" />
          </motion.div>
          
          <div className="space-y-2">
            <DialogTitle className="font-bricolage text-2xl md:text-3xl font-extrabold tracking-tight text-black">
              {title}
            </DialogTitle>
            <p className="text-sm md:text-base text-black/50 font-medium leading-relaxed">
              {description}
            </p>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <Button 
            variant="outline" 
            disabled={loading}
            className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-black/5 hover:bg-black/5 transition-all" 
            onClick={onClose}
          >
            Go Back
          </Button>
          <Button 
            disabled={loading}
            className="flex-1 h-14 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2" 
            onClick={handleConfirm}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Confirm Delete
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">
            This action is irreversible
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
