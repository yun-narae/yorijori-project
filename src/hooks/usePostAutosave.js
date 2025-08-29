// src/hooks/usePostAutosave.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useConfirm } from "../components/Modal/ConfirmProvider";

const DEFAULT_KEY = "draft:post";
const MAX_BYTES = 4_000_000;
const SAVE_DEBOUNCE_MS = 250;

// -------- 유틸 --------
const digits = (s) => String(s ?? "").replace(/\D/g, "");
const withJson = (v) => { try { return JSON.stringify(v); } catch { return ""; } };

// step0에서 “의미 있는 입력”만 감지
function hasStep0MeaningfulInput(formData = {}, images = []) {
    const title = (formData.title || "").trim();
    const isFree = !!formData.isFreeClass;
    const hasImages = Array.isArray(images) && images.length > 0;
    return !!title || isFree || hasImages;
}

// 폼 전체의 “의미 있는 입력”
function hasMeaningfulChanges(formData = {}, images = []) {
    const title = (formData.title || "").trim();
    const desc = (formData.description || "").trim();
    const addr = (formData.address || "").trim();
    const date = (formData.date || "").trim();
    const ts   = (formData.timeStart || "").trim();
    const te   = (formData.timeEnd || "").trim();
    const cat  = Array.isArray(formData.category) ? formData.category : [];
    const isFree = !!formData.isFreeClass;

    const feeNum = Number(digits(formData.fee));
    const capNum = Number(digits(formData.capacity));
    const nonDefaultFee = isFree ? false : (feeNum > 0 && feeNum !== 10000);
    const nonDefaultCap = !Number.isNaN(capNum) && capNum !== 2;

    const hasImg = Array.isArray(images) && images.length > 0;

    return (
        !!title || !!desc || !!addr || !!date || !!ts || !!te ||
        cat.length > 0 || isFree || nonDefaultFee || nonDefaultCap || hasImg
    );
}

/* ---------- 훅 본체 ---------- */
export default function usePostAutosave({
    step,
    setStep,
    formData,
    setFormData,
    images,                 // File[]
    handleAddImage,         // 배열/File/이벤트 모두 허용, { replace } 지원

    // 옵션
    storageKey = DEFAULT_KEY,
    enableConfirm = true,
    confirmLeaveMsg = "작성중인 모임이 있습니다.\n 임시저장 하겠습니까?",
    confirmResumeMsg = "임시저장된 모임이 있습니다.\n 이어서 작성하시겠습니까?",
    autoClearOnStep = null, // 예: 8 단계 도달 시 자동 삭제
}) {
    const confirm = useConfirm();

    const firstLoadRef = useRef(true);
    const savingRef = useRef(false);
    const [isDirty, setIsDirty] = useState(false);
    const [suppressLeave, setSuppressLeave] = useState(false); // 제출 직전 이탈 경고 억제

    const clearAutosave = useCallback(() => {
        try { localStorage.removeItem(storageKey); } catch (e) { console.error("[Autosave] clear 실패:", e); }
    }, [storageKey]);

    const savePayload = useCallback(async () => {
        if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
            clearAutosave();
            return null;
        }

        const imageDataUrls = [];
        if (Array.isArray(images)) {
            for (const f of images) {
                try {
                    const buf = await f.arrayBuffer();
                    const blob = new Blob([buf], { type: f.type || "image/*" });
                    const objUrl = URL.createObjectURL(blob);
                    try {
                        const img = await new Promise((resolve, reject) => {
                            const i = new Image();
                            i.onload = () => resolve(i);
                            i.onerror = reject;
                            i.src = objUrl;
                        });
                        const { width, height } = img;
                        const max = 960;
                        const ratio = Math.min(1, max / Math.max(width, height) || 1);
                        const w = Math.max(1, Math.round(width * ratio));
                        const h = Math.max(1, Math.round(height * ratio));
                        const canvas = document.createElement("canvas");
                        canvas.width = w; canvas.height = h;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, w, h);
                        imageDataUrls.push(canvas.toDataURL("image/jpeg", 0.7));
                    } finally {
                        URL.revokeObjectURL(objUrl);
                    }
                } catch (e) {
                    console.warn("[Autosave] 이미지 축소 실패 → 제외:", e);
                }
            }
        }

        let payload = { step, formData, images: imageDataUrls };
        let text = withJson(payload);

        if (text.length > MAX_BYTES) {
            console.warn("[Autosave] 용량 초과, 이미지 제외하고 저장.", { bytes: text.length, max: MAX_BYTES });
            payload = { step, formData, images: [] };
            text = withJson(payload);
        }
        return text;
    }, [step, formData, images, clearAutosave]);

    const saveNow = useCallback(async () => {
        try {
            savingRef.current = true;
            const text = await savePayload();
            if (text != null) localStorage.setItem(storageKey, text);
        } catch (e) {
            console.error("[Autosave] saveNow 실패:", e);
        } finally {
            savingRef.current = false;
        }
    }, [savePayload, storageKey]);

    const markCleanTemporarily = useCallback(() => setSuppressLeave(true), []);
    const finishAutosave = useCallback(() => {
        setSuppressLeave(true);
        clearAutosave();
    }, [clearAutosave]);

    useEffect(() => {
        try {
            setIsDirty(hasMeaningfulChanges(formData, images));
        } catch {
            setIsDirty(false);
        }
    }, [formData, images]);

    useEffect(() => {
        if (autoClearOnStep == null) return;
        if (step === autoClearOnStep) {
            clearAutosave();
            setSuppressLeave(true);
        }
    }, [step, autoClearOnStep, clearAutosave]);

    // 디바운스 저장
    useEffect(() => {
        if (suppressLeave) return;
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                savingRef.current = true;

                if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
                    if (!cancelled) clearAutosave();
                    return;
                }

                const text = await savePayload();
                if (text == null) return;
                if (!cancelled) localStorage.setItem(storageKey, text);
            } catch (e) {
                console.error("[Autosave] 저장 실패:", e);
            } finally {
                savingRef.current = false;
            }
        }, SAVE_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [step, formData, images, storageKey, savePayload, suppressLeave, clearAutosave]);

    // 입장 시: 복원 여부 확인(모달)
    useEffect(() => {
        if (!firstLoadRef.current) return;
        firstLoadRef.current = false;

        (async () => {
            try {
                const raw = localStorage.getItem(storageKey);
                if (!raw) return;

                let shouldRestore = true;
                if (enableConfirm) {
                    const ok = await confirm({
                        title: confirmResumeMsg,
                        confirmText: "확인",
                        cancelText: "취소",
                    });
                    shouldRestore = !!ok;
                }
                if (!shouldRestore) {
                    clearAutosave();
                    return;
                }

                const draft = JSON.parse(raw);
                if (draft?.formData) setFormData(draft.formData);
                if (typeof draft?.step === "number") setStep(draft.step);

                if (Array.isArray(draft?.images) && draft.images.length) {
                    Promise.all(
                        draft.images.map(async (url, i) => {
                            const res = await fetch(url);
                            const blob = await res.blob();
                            const ext = (blob.type?.split("/")[1] || "jpg").replace("+xml", "");
                            return new File([blob], `draft-${i}.${ext}`, { type: blob.type || "image/jpeg" });
                        })
                    )
                    .then((files) => handleAddImage(files, { replace: true }))
                    .catch((e) => console.warn("[Autosave] 이미지 복원 실패(텍스트만 복원):", e));
                }
            } catch (e) {
                console.error("[Autosave] 복원 실패:", e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirm, enableConfirm, storageKey]);

    // 새로고침/탭닫기: beforeunload 경고 (커스텀 모달 불가 → 기본 다이얼로그 유지)
    useEffect(() => {
        if (!enableConfirm) return;

        const handleBeforeUnload = (e) => {
            if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
                clearAutosave();
                return;
            }
            if (!isDirty || savingRef.current || suppressLeave) return;
            e.preventDefault();
            e.returnValue = confirmLeaveMsg;
            return confirmLeaveMsg;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [enableConfirm, isDirty, confirmLeaveMsg, suppressLeave, step, formData, images, clearAutosave]);

    // 내부 이동(a[href]) 인터셉트: 모달로 저장/삭제 선택
    useEffect(() => {
        if (!enableConfirm) return;

        const handler = async (e) => {
            if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
                clearAutosave();
                return;
            }
            if (!isDirty || savingRef.current || suppressLeave) return;

            const anchor = e.target.closest?.("a[href]");
            if (!anchor) return;
            if (anchor.target === "_blank" || anchor.download) return;

            e.preventDefault();
            const ok = await confirm({
                title: confirmLeaveMsg,
                confirmText: "확인",
                cancelText: "취소",
            });
            try {
                if (ok) {
                    await saveNow();
                } else {
                    clearAutosave();
                }
            } catch (err) {
                console.error("[Autosave] 이탈 확인 중 오류:", err);
            } finally {
                window.location.assign(anchor.href);
            }
        };

        document.addEventListener("click", handler, true);
        return () => document.removeEventListener("click", handler, true);
    }, [enableConfirm, isDirty, confirmLeaveMsg, suppressLeave, saveNow, step, formData, images, clearAutosave, confirm]);

    // 외부에서 호출 가능한 이탈 확인: 모달 사용
    const confirmBeforeLeave = useCallback(async () => {
        if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
            clearAutosave();
            return true;
        }
        if (!enableConfirm || !isDirty || savingRef.current || suppressLeave) return true;

        const ok = await confirm({
            title: confirmLeaveMsg,
            confirmText: "확인",
            cancelText: "취소",
        });
        if (ok) {
            await saveNow();
        } else {
            clearAutosave();
        }
        return true;
    }, [enableConfirm, isDirty, confirmLeaveMsg, suppressLeave, saveNow, step, formData, images, clearAutosave, confirm]);

    return {
        clearAutosave,
        markCleanTemporarily,
        confirmBeforeLeave,
        finishAutosave,
    };
}
