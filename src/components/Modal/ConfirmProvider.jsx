import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { createPortal } from "react-dom";
import CustomButton from "../CustomButton/CustomButton";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

const ConfirmContext = createContext(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
    return ctx.confirm;
}

export default function ConfirmProvider({ children }) {
    const resolverRef = useRef(null);
    const dialogRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState({
        title: "",
        description: "",
        confirmText: "확인",
        cancelText: "취소",
        tone: "default", // 'default' | 'danger'
    });
    useLockBodyScroll(open);

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

    // ESC 키로 닫기 (모달 열렸을 때만 리스너 등록)
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, handleClose]);

    // 열릴 때 포커스를 다이얼로그에 부여
    useEffect(() => {
        if (open && dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [open]);

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
                    >
                        {/* overlay */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={handleClose}
                        />
                        {/* dialog */}
                        <div
                            ref={dialogRef}
                            tabIndex={-1}
                            className="relative w-[90vw] max-w-[420px] rounded-xl bg-[var(--color-gray-1)] flex flex-col gap-2 p-4 shadow-xl outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col gap-2 items-center py-4">
                                <h3 className="text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md font-bold text-[var(--color-gray-8)]">
                                    {opts.title || "확인"}
                                </h3>
                                {opts.description && (
                                    <p className="text-[var(--color-gray-6)]">
                                        {opts.description}
                                    </p>
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
