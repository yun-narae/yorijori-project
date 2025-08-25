// src/hooks/usePostAutosave.js
import { useEffect, useRef, useState, useCallback } from "react";

const DEFAULT_KEY = "draft:post";
const MAX_BYTES = 4_000_000;        // localStorage 여유 한도(약 4MB)
const SAVE_DEBOUNCE_MS = 250;

// -------- 유틸 --------
const digits = (s) => String(s ?? "").replace(/\D/g, "");
const withJson = (v) => {
    try { return JSON.stringify(v); } catch { return ""; }
};

// step0에서 “의미 있는 입력”만 감지: 제목 입력 또는 무료클래스 on
function hasStep0MeaningfulInput(formData = {}, images = []) {
    const title = (formData.title || "").trim();
    const isFree = !!formData.isFreeClass;
    const hasImages = Array.isArray(images) && images.length > 0; // 방어
    return !!title || isFree || hasImages;
}

// 폼 전체의 “의미 있는 입력” (기본값만 있는 경우 제외)
function hasMeaningfulChanges(formData = {}, images = []) {
    const title = (formData.title || "").trim();
    const desc = (formData.description || "").trim();
    const addr = (formData.address || "").trim();
    const date = (formData.date || "").trim();
    const ts   = (formData.timeStart || "").trim();
    const te   = (formData.timeEnd || "").trim();
    const cat  = Array.isArray(formData.category) ? formData.category : [];
    const isFree = !!formData.isFreeClass;

    // 기본값(초기)로 간주하는 값: capacity=2, fee=10,000
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
    confirmLeaveMsg = "작성중인 모임이 있습니다. 임시저장 하겠습니까?",
    confirmResumeMsg = "임시저장된 모임이 있습니다. 이어서 작성하시겠습니까?",
    autoClearOnStep = null, // 예: 8 단계 도달 시 자동 삭제
}) {
    const firstLoadRef = useRef(true);
    const savingRef = useRef(false);
    const [isDirty, setIsDirty] = useState(false);
    const [suppressLeave, setSuppressLeave] = useState(false); // 제출 직전 이탈 경고 억제

    const clearAutosave = useCallback(() => {
        try { localStorage.removeItem(storageKey); } catch (e) { console.error("[Autosave] clear 실패:", e); }
    }, [storageKey]);

    const savePayload = useCallback(async () => {
        // step0에서 의미 있는 입력이 없다면 저장하지 않고 잔여본도 삭제
        if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
            clearAutosave();
            return null;
        }

        // 이미지 → dataURL (용량 방어)
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

    // 외부에서: 제출 직전 호출해 이탈 경고 억제
    const markCleanTemporarily = useCallback(() => setSuppressLeave(true), []);

    // 제출 완료 후: 완전 종료(추가 저장 차단 + 즉시 삭제)
    const finishAutosave = useCallback(() => {
        setSuppressLeave(true);
        clearAutosave();
    }, [clearAutosave]);

    // 더티 체크(기본값만 있는 상태는 더티 아님)
    useEffect(() => {
        try {
            setIsDirty(hasMeaningfulChanges(formData, images));
        } catch {
            setIsDirty(false);
        }
    }, [formData, images]);

    // 특정 스텝 도달 시 자동 삭제(예: 완료 단계)
    useEffect(() => {
        if (autoClearOnStep == null) return;
        if (step === autoClearOnStep) {
            clearAutosave();
            setSuppressLeave(true); // 완료화면에서 추가 confirm 방지
        }
    }, [step, autoClearOnStep, clearAutosave]);

    // 디바운스 저장
    useEffect(() => {
        if (suppressLeave) return; // 제출 직후 저장 차단
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                savingRef.current = true;

                // step0 & 입력 없음 → 저장 대신 삭제
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

    // 입장 시: 복원 여부 확인(아니오면 삭제)
    useEffect(() => {
        if (!firstLoadRef.current) return;
        firstLoadRef.current = false;

        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;

            const shouldRestore = enableConfirm ? window.confirm(confirmResumeMsg) : true;
            if (!shouldRestore) {
                clearAutosave();
                return;
            }

            const draft = JSON.parse(raw);
            if (draft?.formData) setFormData(draft.formData);
            if (typeof draft?.step === "number") setStep(draft.step);

            if (Array.isArray(draft?.images) && draft.images.length) {
                // dataURL → File
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 새로고침/탭닫기: beforeunload 경고
    useEffect(() => {
        if (!enableConfirm) return;

        const handleBeforeUnload = (e) => {
            // step0 & 입력 없음 → 경고 없이 삭제 후 통과
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

    // 내부 이동(a[href]) 인터셉트: 예=저장 / 아니오=삭제
    useEffect(() => {
        if (!enableConfirm) return;

        const handler = async (e) => {
            // step0 & 입력 없음 → draft 삭제하고 그냥 통과
            if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
                clearAutosave();
                return; // 기본 동작 진행
            }
            if (!isDirty || savingRef.current || suppressLeave) return;

            const anchor = e.target.closest?.("a[href]");
            if (!anchor) return;
            if (anchor.target === "_blank" || anchor.download) return;

            e.preventDefault();
            const ok = window.confirm(confirmLeaveMsg);
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
    }, [enableConfirm, isDirty, confirmLeaveMsg, suppressLeave, saveNow, step, formData, images, clearAutosave]);

    // 외부에서 호출 가능한 이탈 확인
    const confirmBeforeLeave = useCallback(async () => {
        // step0 & 입력 없음 → 바로 삭제 후 통과
        if (step === 0 && !hasStep0MeaningfulInput(formData, images)) {
            clearAutosave();
            return true;
        }
        if (!enableConfirm || !isDirty || savingRef.current || suppressLeave) return true;
        const ok = window.confirm(confirmLeaveMsg);
        if (ok) {
            await saveNow();
        } else {
            clearAutosave();
        }
        return true;
    }, [enableConfirm, isDirty, confirmLeaveMsg, suppressLeave, saveNow, step, formData, images, clearAutosave]);

    return {
        clearAutosave,
        markCleanTemporarily,   // 제출 직전 호출(이탈 경고 억제)
        confirmBeforeLeave,     // 프로그램적 이동 전 직접 호출 가능
        finishAutosave,         // 제출 완료 시 호출(저장 종료 + draft 삭제)
    };
}
