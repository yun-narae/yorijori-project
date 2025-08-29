import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomButton from '../CustomButton/CustomButton';

const ConfirmContext = createContext(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
    return ctx.confirm;
}

export default function ConfirmProvider({ children }) {
    const resolverRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState({
        title: "",
        description: "",
        confirmText: "확인",
        cancelText: "취소",
        tone: "default", // 'default' | 'danger'
    });

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
        resolverRef.current = resolve;
        setOpts((prev) => ({ ...prev, ...options }));
        setOpen(true);
        });
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        if (resolverRef.current) resolverRef.current(false);
        resolverRef.current = null;
    }, []);

    const handleConfirm = useCallback(() => {
        setOpen(false);
        if (resolverRef.current) resolverRef.current(true);
        resolverRef.current = null;
    }, []);

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
        {children}
            {open &&
                createPortal(
                <div
                    aria-modal="true"
                    role="dialog"
                    className="fixed inset-0 z-[1000] flex items-center justify-center"
                    onKeyDown={(e) => e.key === "Escape" && handleClose()}
                >
                    {/* overlay */}
                    <div 
                        className="absolute inset-0 bg-black/40" 
                        onClick={handleClose} 
                    />
                    {/* dialog */}
                    <div className="relative w-[90vw] max-w-[420px] rounded-xl bg-[var(--color-gray-1)] flex flex-col gap-2 p-4 shadow-xl">
                        <div className="flex flex-col gap-2 items-center py-4">
                            <h3 className="text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md font-bold text-[var(--color-gray-8)]">
                                {opts.title || "확인"}
                            </h3>
                            {opts.description && (
                                <p className="text-[var(--color-gray-6)]">{opts.description}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <CustomButton 
                                text={opts.cancelText || "취소"}
                                variant="secondary"
                                onClick={handleClose}
                            />
                            <CustomButton 
                                text={opts.confirmText || "확인"}
                                onClick={handleConfirm}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </ConfirmContext.Provider>
    );
}
