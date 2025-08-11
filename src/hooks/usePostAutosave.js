import { useEffect, useRef } from "react";

export default function usePostAutosave({
    step, setStep,
    formData, setFormData,
    images, handleAddImage,
    draftKey = "postCreateAutosave_v1",
    createPath = "/post/create",
    confirmLeaveMsg = "작성중인 모임이 있습니다. 임시저장 하겠습니까?",
    confirmResumeMsg = "임시저장된 모임이 있습니다. 이어서 작성하시겠습니까?",
    completeStep = 8, // 완료 단계 번호
}) {
    const stepRef = useRef(step);
    const formRef = useRef(formData);
    const imagesRef = useRef(images);
    const disabledRef = useRef(false);  // 완료 시 가드 비활성화 플래그
    const handlersRef = useRef({});     // 리스너 참조 저장

    useEffect(() => { stepRef.current = step; }, [step]);
    useEffect(() => { formRef.current = formData; }, [formData]);
    useEffect(() => { imagesRef.current = images; }, [images]);

    const filesToDataUrls = (files = []) =>
        Promise.all([...files].map(file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result });
            reader.readAsDataURL(file);
        })));

    const dataUrlToFile = async ({ name = "image", type = "image/*", dataUrl }) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], name, { type: blob.type || type });
    };

    const loadDraft = () => {
        try { return JSON.parse(localStorage.getItem(draftKey) || "null"); }
        catch { return null; }
    };
    const clearAutosave = () => localStorage.removeItem(draftKey);

    const hasDirty = () => {
        const f = formRef.current || {};
        const textDirty =
            f.title?.trim() ||
            f.description?.trim() ||
            (f.category?.length || 0) > 0 ||
            f.address?.trim() ||
            f.date?.trim() ||
            f.timeStart?.trim() ||
            f.timeEnd?.trim() ||
            (f.capacity && f.capacity !== "2") ||
            (!f.isFreeClass && (f.fee && f.fee !== "10,000"));
        const imgDirty = (imagesRef.current?.length || 0) > 0;
        return !!(textDirty || imgDirty);
    };

    const saveDraft = async () => {
        try {
            const imagePayload = await filesToDataUrls(imagesRef.current || []);
            const payload = {
                formData: formRef.current,
                step: stepRef.current,
                images: imagePayload,
                savedAt: Date.now(),
            };
            localStorage.setItem(draftKey, JSON.stringify(payload));
            return true;
        } catch (e) {
            console.error("임시저장 실패:", e);
            return false;
        }
    };

    const restoreDraft = async (draft) => {
        if (!draft) return;
        try {
            const { formData: savedForm, step: savedStep, images: savedImages } = draft;
            setFormData((s) => ({ ...s, ...savedForm }));
            if (typeof savedStep === "number" && savedStep >= 0 && savedStep <= 7) {
                setStep(savedStep);
            }
            if (Array.isArray(savedImages) && savedImages.length > 0) {
                for (const meta of savedImages) {
                    const file = await dataUrlToFile(meta);
                    handleAddImage(file);
                }
            }
        } catch (e) {
            console.error("임시저장 복원 실패:", e);
        }
    };

    const shouldGuard = (fromPath, toPath) =>
        fromPath.startsWith(createPath) && toPath && !toPath.startsWith(createPath);

    const confirmAndMaybeSave = () => {
        if (disabledRef.current || stepRef.current === completeStep || !hasDirty()) return true;
        const doSave = window.confirm(confirmLeaveMsg);
        if (doSave) saveDraft();
        else clearAutosave();
        return true;
    };

    useEffect(() => {
        // 진입 시 이어쓰기 여부
        const draft = loadDraft();
        if (draft) {
            const resume = window.confirm(confirmResumeMsg);
            if (resume) restoreDraft(draft);
            else clearAutosave();
        }

        const onPopState = () => {
            if (disabledRef.current || stepRef.current === completeStep) return;
            confirmAndMaybeSave();
        };

        const onDocumentClick = (e) => {
            if (disabledRef.current || stepRef.current === completeStep) return;
            const a = e.target.closest?.("a[href]");
            if (!a) return;
            const url = new URL(a.getAttribute("href"), location.href);
            if (url.origin !== location.origin) return;
            const from = location.pathname;
            const to = url.pathname;
            if (!shouldGuard(from, to) || !hasDirty()) return;
            e.preventDefault();
            const doSave = window.confirm(confirmLeaveMsg);
            const go = () => { location.href = url.href; };
            if (doSave) saveDraft().finally(go);
            else { clearAutosave(); go(); }
        };

        const origPush = history.pushState;
        const origReplace = history.replaceState;
        const wrap = (orig) => function wrapped(state, title, url) {
            if (!(disabledRef.current || stepRef.current === completeStep)) {
                try {
                    const toUrl = typeof url === "string" ? new URL(url, location.href) : null;
                    const toPath = toUrl ? toUrl.pathname : location.pathname;
                    const fromPath = location.pathname;
                    if (shouldGuard(fromPath, toPath) && hasDirty()) {
                        confirmAndMaybeSave();
                    }
                } catch {}
            }
            return orig.apply(this, arguments);
        };
        history.pushState = wrap(origPush);
        history.replaceState = wrap(origReplace);

        const onBeforeUnload = (e) => {
            if (disabledRef.current || stepRef.current === completeStep || !hasDirty()) return;
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("popstate", onPopState);
        document.addEventListener("click", onDocumentClick, true);
        window.addEventListener("beforeunload", onBeforeUnload);

        handlersRef.current = { onPopState, onDocumentClick, onBeforeUnload, origPush, origReplace };

        return () => {
            window.removeEventListener("popstate", onPopState);
            document.removeEventListener("click", onDocumentClick, true);
            window.removeEventListener("beforeunload", onBeforeUnload);
            history.pushState = origPush;
            history.replaceState = origReplace;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 완료 단계에 도달하면 즉시 가드 비활성화 + 리스너 해제 + 초안 정리
    useEffect(() => {
        if (step === completeStep) {
            disabledRef.current = true;
            const h = handlersRef.current || {};
            if (h.onPopState) window.removeEventListener("popstate", h.onPopState);
            if (h.onDocumentClick) document.removeEventListener("click", h.onDocumentClick, true);
            if (h.onBeforeUnload) window.removeEventListener("beforeunload", h.onBeforeUnload);
            if (h.origPush) history.pushState = h.origPush;
            if (h.origReplace) history.replaceState = h.origReplace;
            clearAutosave(); // 혹시 남아있을 수 있는 초안 제거
        }
    }, [step, completeStep]);

    return { saveDraft, restoreDraft, loadDraft, clearAutosave, hasDirty };
}
