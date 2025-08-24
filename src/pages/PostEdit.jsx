import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import pb from "../lib/pocketbase";

import Input from "../components/Input/Input";
import RadioListItem from "../components/RadioListItem/RadioListItem";
import CustomButton from "../components/CustomButton/CustomButton";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import SelectImageGroup from "../components/SelectImageGroup/SelectImageGroup";
import SvgIcon from "../components/SvgIcon/SvgIcon";
import Header from "../components/Header/Header";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import TimeInput from "../components/TimeWheelPicker/TimeInput";
import DateInput from "../components/Calendar/DateInput";
import PostCreateSkeleton from "../components/Skeletons/PostCreateSkeleton";
import useFetchFiles from "../hooks/useFetchFiles";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 1000);
const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const LAYOUT_CLASSES = {
    title: "text-[var(--color-gray-8)] font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg",
    subtitle: "font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)]",
    Wrapper: "flex flex-col gap-6",
    titleWrapper: "flex flex-col gap-1",
    InfoWrapper: "flex flex-col gap-3",
    titleAndInfoWrapper: "flex flex-col gap-3",
    InfoWrap: "flex flex-wrap gap-1 items-center",
};

const TEXT_CLASSES = {
    label: "text-[var(--color-gray-7)] font-bold",
    labelDark: "text-[var(--color-gray-8)] font-bold",
    content: "text-[var(--color-gray-6)]",
    tag: "text-mo-text tablet:text-tab-text desktop:text-pc-text px-3 py-1 rounded-full bg-[var(--color-gray-1)] text-[var(--color-gray-7)]",
    timeTag: "px-2 py-1 rounded bg-[var(--color-gray-1)] text-[var(--color-gray-7)]"
};

const categories = ["한식", "양식", "일식", "브런치", "중식", "분식", "베이킹"];
const CATEGORY_BASE = "transparent px-4 py-2 w-min whitespace-nowrap text-mo-button tablet:text-tab-button desktop:text-pc-button font-bold rounded-full transition";
const CATEGORY_STATE = {
    default: "text-[var(--color-gray-7)] bg-[var(--color-gray-1) border border-[var(--color-gray-2)] hover:border-[var(--color-gray-6)]",
    select: "border border-[var(--color-redorange-2)] text-[var(--color-redorange-2)] hover:bg-[var(--color-gray-2)]"
};

export default function PostEdit() {
    const navigate = useNavigate();
    const { postId } = useParams();

    // 로딩(스켈레톤)
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const showSkeleton = dataLoading || isSubmitting || initialLoading;

    // 기존 서버 이미지(프리뷰/유지)
    const [existingImageUrls, setExistingImageUrls] = useState([]);   // 미리보기 URL (80x80)
    const [keepImageNames, setKeepImageNames] = useState([]);         // 업데이트 시 보낼 기존 파일명

    // 새로 추가한 파일
    const [editFiles, setEditFiles] = useState([]);

    // 폼 상태 (생성 페이지와 동일 필드/구조)
    const [step, setStep] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    const [selectedValue, setSelectedValue] = useState("default");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: [],
        address: "",
        date: "",
        timeStart: "",
        timeStartLabel: "",
        timeEnd: "",
        timeEndLabel: "",
        capacity: "2",
        isFreeClass: false,
        fee: "10,000",
    });

    const MAX_IMAGES = 3;
    const MAX_FILE_BYTES = 5 * 1024 * 1024;

    // 반응형 체크
    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 1060);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // pb 파일 URL(썸네일)
    const buildPostImageUrl = (rec, file, thumb = "80x80") => {
        const core = pb.files.getURL(rec, file);
        return `${core}?thumb=${thumb}`;
    };

    // 초기 데이터 로드
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const rec = await pb.collection("post").getOne(postId);
                if (!mounted) return;

                setFormData({
                    title: rec.title || "",
                    description: rec.description || "",
                    category: Array.isArray(rec.category) ? rec.category : (rec.category ? JSON.parse(rec.category) : []),
                    address: rec.location || "",
                    date: rec.date || "",
                    timeStart: rec.timeStart || "",
                    timeStartLabel: rec.timeStartLabel || rec.timeStart || "",
                    timeEnd: rec.timeEnd || "",
                    timeEndLabel: rec.timeEndLabel || rec.timeEnd || "",
                    capacity: String(rec.capacity ?? "2"),
                    isFreeClass: !!rec.isFreeClass,
                    fee: rec.isFreeClass ? "0" : String(rec.fee ?? "10000").replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                });

                const names = Array.isArray(rec.images) ? rec.images : (rec.images ? [rec.images] : []);
                setKeepImageNames(names);
                setExistingImageUrls(names.map((name) => buildPostImageUrl(rec, name)));
            } catch (err) {
                console.error("초기 로드 실패:", err);
                alert("게시글 정보를 불러오지 못했습니다.");
                navigate(-1);
            } finally {
                setInitialLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [postId, navigate]);

    // 새 파일 추가
    const handleAddFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_BYTES) {
            alert("이미지 용량이 5MB를 초과합니다. 용량을 줄여 다시 시도해 주세요.");
            e.target.value = "";
            return;
        }

        const used = keepImageNames.length + editFiles.length;
        if (used >= MAX_IMAGES) {
            alert(`이미지는 최대 ${MAX_IMAGES}장까지 등록할 수 있어요.`);
            e.target.value = "";
            return;
        }

        setEditFiles((prev) => [...prev, file]);
        e.target.value = "";
    };

    // 새 파일 제거
    const handleRemoveFile = (idx) => {
        setEditFiles((prev) => prev.filter((_, i) => i !== idx));
        alert("삭제되었습니다.");
    };

    // 기존 서버 이미지 제거(프리뷰 + 유지목록)
    const handleRemoveStatic = (idx) => {
        setExistingImageUrls((prev) => prev.filter((_, i) => i !== idx));
        setKeepImageNames((prev) => prev.filter((_, i) => i !== idx));
        alert("삭제되었습니다.");
    };

    // ===== 텍스트 검증(생성 페이지와 동일) =====
    const ALLOW_RE = /^[\p{L}\p{N}\s]+$/u;
    const makeCountSub = (len, max) => [{ text: `${len}/${max}`, type: "info" }];
    const makeTitleSubs = (text) => {
        const len = (text || "").length;
        const subs = makeCountSub(len, 40);
        if (!text || !text.trim()) return [{ text: `${len}/40`, type: "info" }];
        if (!ALLOW_RE.test(text)) return [{ text: "특수문자는 사용할 수 없어요.", type: "error" }, ...subs];
        if (len > 40) return [{ text: "최대 40자까지 입력 가능해요.", type: "error" }, ...subs];
        return subs;
    };
    const makeDescSubs = (text) => {
        const len = (text || "").length;
        const subs = makeCountSub(len, 1000);
        if (!text || !text.trim()) return [{ text: `${len}/1000`, type: "info" }];
        if (!ALLOW_RE.test(text)) return [{ text: "특수문자는 사용할 수 없어요.", type: "error" }, ...subs];
        if (len > 1000) return [{ text: "최대 1000자까지 입력 가능해요.", type: "error" }, ...subs];
        return subs;
    };
    const isTitleValid = (t) => !!t && !!t.trim() && ALLOW_RE.test(t) && t.length <= 40;
    const isDescValid  = (t) => !!t && !!t.trim() && ALLOW_RE.test(t) && t.length <= 1000;

    // step 1 - category 
    const handleCategoryClick = (category) => {
        setFormData((prev) => {
            const alreadySelected = prev.category.includes(category);
            if (alreadySelected) {
                return { ...prev, category: prev.category.filter((c) => c !== category) };
            } else {
                if (prev.category.length < 3) {
                    return { ...prev, category: [...prev.category, category] };
                } else {
                    alert("최대 3개까지 선택할 수 있어요.");
                    return prev;
                }
            }
        });
    };

    // step 5 - fee
    const [feeSubTexts, setFeeSubTexts] = useState([
        { text: "최소 10,000원부터 가능합니다.", type: "info" },
    ]); 
    const onlyDigits = (s) => s.replace(/[^\d]/g, "");
    const withComma = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const handleFeeChange = (e) => {
        const raw = onlyDigits(e.target.value);      // "10000"
        const view = raw ? withComma(raw) : "";      // "10,000" or ""
    
        setFormData((s) => ({ ...s, fee: view }));
    
        // 기본: 안내 문구
        if (!raw) {
            setFeeSubTexts([{ text: "최소 10,000원부터 가능합니다.", type: "info" }]);
            return;
        }
    
        const n = Number(raw);
        if (n >= 10000) {
            // 유효: 모든 subTexts 숨김
            setFeeSubTexts([]);
        } else {
            // 미만: 에러 문구
            setFeeSubTexts([{ text: "10,000원 이상 입력해주세요.", type: "error" }]);
        }
    };

    // step 6 - capacity
        // 숫자만 남기기
        const onlyDigitsCapacity = (s = "") => (s + "").replace(/\D/g, "");

        // 인원 변경 핸들러
        const setCapacity = (next) => {
            const clamped = Math.max(0, Math.min(99, next)); // 입력 깔끔히
            setFormData((s) => ({ ...s, capacity: String(clamped) }));
        };

        const handleCapacityInput = (e) => {
            const digits = onlyDigitsCapacity(e.target.value);
            setFormData((s) => ({ ...s, capacity: digits }));
        };

        // 화살표 증감
        const incCapacity = () => {
            const n = Number(onlyDigitsCapacity(formData.capacity || "0")) || 0;
            if (n >= 20) return;
            setCapacity(n + 1);
        };
        const decCapacity = () => {
            const n = Number(onlyDigitsCapacity(formData.capacity || "0")) || 0;
            if (n <= 2) return;
            setCapacity(n - 1);
        };

    // “다음” 활성화 조건
    const isNextEnabled = useCallback(() => {
        switch (step) {
            case 0: return isTitleValid(formData.title);
            case 1: return formData.category.length > 0;
            case 2: {
                const hasAnyImage = (existingImageUrls.length + editFiles.length) > 0;
                return isDescValid(formData.description) && hasAnyImage;
            }
            case 3: return !!formData.address?.trim();
            case 4: return !!formData.timeStart && !!formData.timeEnd;
            case 5: {
                if (formData.isFreeClass) return true;
                const feeNum = Number((formData.fee || "0").replace(/\D/g, ""));
                return feeNum >= 10000;
            }
            case 6: return true;
            default: return true;
        }
    }, [step, formData, existingImageUrls.length, editFiles.length]);

    // 업데이트
    const updatePostInPocketBase = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const start = Date.now();
        try {
            const fd = new FormData();
            const toNum = (s) => Number((s || "").replace(/[^\d]/g, ""));
            const trim = (s) => (s || "").trim();

            // 문자열
            fd.append("title", trim(formData.title));
            fd.append("description", trim(formData.description));
            fd.append("location", trim(formData.address));
            fd.append("date", formData.date);
            fd.append("timeStart", formData.timeStart);
            fd.append("timeEnd", formData.timeEnd);

            // 숫자
            fd.append("capacity", String(toNum(formData.capacity)));
            fd.append("fee", String(toNum(formData.fee)));

            // 멀티값(JSON)
            fd.append("category", JSON.stringify(formData.category || []));

            // 1) 유지할 기존 파일명
            keepImageNames.forEach((name) => fd.append("images", name));
            // 2) 새 파일
            editFiles.forEach((file, i) => {
                if (file instanceof File) fd.append("images", file, file.name || `image-${i}.jpg`);
            });

            // 편집자(규칙으로 자동이면 제외)
            const user = pb.authStore.model;
            if (user?.id) fd.append("editor", user.id);

            await pb.collection("post").update(postId, fd);

            alert("수정되었습니다.");
            setStep(8); // 완료 화면으로
            window.dispatchEvent(new CustomEvent("post:updated", { detail: { id: postId } }));
        } catch (error) {
            const details = error?.response?.data || error?.data;
            console.error("수정 실패:", error, details);
            alert("수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            const elapsed = Date.now() - start;
            const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
            setTimeout(() => setIsSubmitting(false), remain);
        }
    }, [isSubmitting, formData, keepImageNames, editFiles, postId]);

    const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    // 확인(step=7)에서 사용할 합쳐진 미리보기
    const allPreviews = useMemo(() => {
        const fresh = editFiles.map((f) => URL.createObjectURL(f));
        return [...existingImageUrls, ...fresh];
    }, [existingImageUrls, editFiles]);

    // objectURL 정리
    useEffect(() => {
        return () => {
            editFiles.forEach((f) => {
                try { URL.revokeObjectURL(f); } catch {}
            });
        };
    }, [editFiles]);

    return (
        <>
            <Header
                fill
                buttons={
                    isDesktop
                        ? [
                            step > 0 && step !== 8 && {
                                text: "이전",
                                size: "md",
                                variant: "tertiary",
                                onClick: prevStep,
                                basebuttonClass: "hover:bg-transparent",
                                basebuttontextClass: "!text-[var(--color-gray-6)]",
                                state: isSubmitting ? "disable" : "default"
                            },
                            step < steps.length - 1 && step !== 7 && step !== 8 && {
                                text: `다음 ${step + 1}/${steps.length}`,
                                size: "md",
                                variant: "primary",
                                onClick: nextStep,
                                custombuttonClass: "desktop:w-[100px]",
                                state: (isSubmitting || !isNextEnabled()) ? "disable" : "default"
                            },
                            step === 7 && {
                                text: "수정하기",
                                size: "md",
                                variant: "primary",
                                basebuttonClass: "w-full",
                                custombuttonClass: "desktop:w-[134px]",
                                onClick: updatePostInPocketBase,
                                state: isSubmitting ? "disable" : "default"
                            },
                            step === 8 && {
                                text: "확인하러 가기",
                                size: "md",
                                variant: "primary",
                                basebuttonClass: "w-full",
                                custombuttonClass: "desktop:max-w-[134px]",
                                onClick: () => navigate(`/post/detail/${postId}`, { replace: true }),
                                state: isSubmitting ? "disable" : "default"
                            }
                        ].filter(Boolean)
                    : undefined
                }
            />

            {step !== 8 && <PageTitleBar className="!mt-28" />}

            {showSkeleton ? (
                <PostCreateSkeleton step={step} />
            ) : (
                <div className="relative h-auto flex flex-col max-w-[500px] mx-auto px-[16px] tablet:px-0 desktop:px-0 mt-8 mb-8">
                    {/* 0. 제목 + 무료클래스 */}
                    {step === 0 && (
                        <div className={LAYOUT_CLASSES.Wrapper}>
                            <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <h2 className={LAYOUT_CLASSES.title}>요리모임의 이름을 지어주세요!</h2>
                                </div>
                                <Input
                                    placeholder="최대 40자까지 가능해요."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    subTexts={makeTitleSubs(formData.title)}
                                />
                            </div>

                            <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <h2 className={LAYOUT_CLASSES.title}>해당 모임은 무료클래스 인가요?</h2>
                                    <p className={LAYOUT_CLASSES.subtitle}>무료클래스일 경우 참가비를 설정하실 수 없습니다.</p>
                                </div>
                                <RadioListItem
                                    options={[
                                        { value: "no", label: "아니오" },
                                        { value: "yes", label: "예" },
                                    ]}
                                    value={formData.isFreeClass ? "yes" : "no"}
                                    onChange={(val) =>
                                        setFormData((s) => ({
                                            ...s,
                                            isFreeClass: val === "yes",
                                            fee: val === "yes" ? "0" : s.fee,
                                        }))
                                    }
                                    state="default"
                                />
                            </div>
                        </div>
                    )}

                    {/* 1. 카테고리 */}
                    {step === 1 && (
                        <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>어떤 테마의 모임을 하시나요?</h2>
                                <p className={LAYOUT_CLASSES.subtitle}>최대 3개까지 선택할 수 있어요.</p>
                            </div>
                            <div className={LAYOUT_CLASSES.InfoWrap}>
                                {categories.map((item) => {
                                    const isSelected = formData.category.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            onClick={() => handleCategoryClick(item)}
                                            className={[
                                                CATEGORY_BASE,
                                                isSelected
                                                        ? `${CATEGORY_STATE.select}`
                                                        : `${CATEGORY_STATE.default}`
                                            ].join(" ")}
                                        >
                                            <p className="translate-y-[1px]">{item}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 2. 소개 + 이미지 */}
                    {step === 2 && (
                        <div className={LAYOUT_CLASSES.Wrapper}>
                            <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <h2 className={LAYOUT_CLASSES.title}>요리모임에 대해 소개해주세요.</h2>
                                </div>
                                <Input
                                    placeholder="최대 1000자까지 가능해요."
                                    name="요리모임에 대한 소개"
                                    textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    subTexts={makeDescSubs(formData.description)}
                                />
                            </div>

                            <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <p className={LAYOUT_CLASSES.subtitle}>모임을 잘 나타낼 수 있는 사진을 골라주세요.</p>
                                </div>

                                <SelectImageGroup
                                    label="모임 이미지"
                                    hideRadioList={true}
                                    images={editFiles}
                                    onAddImage={handleAddFile}
                                    onRemoveImage={handleRemoveFile}
                                    SelectImageclassName=""
                                    state="default"
                                    maxCount={3}
                                    showPostEditPreview={true}
                                    postEditPreviewUrls={existingImageUrls}
                                    staticRemovable={true}
                                    onRemoveStatic={handleRemoveStatic}
                                />
                            </div>
                        </div>
                    )}

                    {/* 3. 장소 */}
                    {step === 3 && (
                        <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>요리 모임할 장소를 입력해주세요.</h2>
                                <p className={LAYOUT_CLASSES.subtitle}>잠깐! 공간 예약 확정 후 장소 정보를 입력해주세요!</p>
                            </div>
                            <div className="relative">
                                <Input
                                    type="address"
                                    placeholder="장소를 검색하세요"
                                    buttontext="장소 찾기"
                                    buttonState="activation"
                                    inputClass="translate-x-4 mr-4"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                <SvgIcon
                                    name="mapPin"
                                    frameClass="absolute left-1 top-1 pointer-events-none"
                                    iconClass="text-[var(--color-gray-5)]"
                                />
                            </div>
                        </div>
                    )}

                    {/* 4. 날짜/시간 */}
                    {step === 4 && (
                        <div className={LAYOUT_CLASSES.Wrapper}>
                            <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <h2 className={LAYOUT_CLASSES.title}>요리 모임의 일정을 정해주세요!</h2>
                                    <p className={LAYOUT_CLASSES.subtitle}>모임할 날짜를 선택해주세요.</p>
                                </div>
                                <DateInput
                                    value={formData.date}
                                    onChange={(ymd) => setFormData((s) => ({ ...s, date: ymd }))}
                                />
                            </div>

                            <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <p className={LAYOUT_CLASSES.subtitle}>모임할 시간을 선택해주세요.</p>
                                </div>
                                <div className={LAYOUT_CLASSES.InfoWrap}>
                                    <TimeInput
                                        value={formData.timeStart}
                                        onChange={(val, label) => setFormData((s) => ({ ...s, timeStart: val, timeStartLabel: label }))}
                                        step={10}
                                    />
                                    <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)]">부터</b>
                                    <TimeInput
                                        value={formData.timeEnd}
                                        minTime={formData.timeStart || undefined}
                                        onChange={(val, label) => setFormData((s) => ({ ...s, timeEnd: val, timeEndLabel: label }))}
                                        step={10}
                                    />
                                    <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)]">까지</b>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. 참가비 */}
                    {step === 5 && (
                        <>
                            {!formData.isFreeClass ? (
                                <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                    <div className={LAYOUT_CLASSES.titleWrapper}>
                                        <h2 className={LAYOUT_CLASSES.title}>참가비를 입력해주세요.</h2>
                                    </div>
                                    <div className={`${LAYOUT_CLASSES.InfoWrap} flex-nowrap`}>
                                        <Input
                                            placeholder="10,000"
                                            value={formData.fee}
                                            inputClass="text-center"
                                            onChange={handleFeeChange}
                                            subTexts={feeSubTexts}
                                        />
                                        <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)] -translate-y-[2px]">원</b>
                                    </div>
                                </div>
                            ) : (
                                <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                                    <div className={LAYOUT_CLASSES.titleWrapper}>
                                        <h2 className={LAYOUT_CLASSES.title}>해당 모임은 무료클래스 입니다.</h2>
                                        <p className={LAYOUT_CLASSES.subtitle}>참가비가 발생하지 않습니다.</p>
                                    </div>
                                    <div className={`${LAYOUT_CLASSES.InfoWrap} flex-nowrap`}>
                                        <Input value="0" inputClass="text-center text-[var(--color-gray-6)]" state="disable" />
                                        <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)]">원</b>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* 6. 인원 */}
                    {step === 6 && (
                        <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>모임할 인원을 입력해주세요.</h2>
                            </div>
                            <div className="relative">
                                <div className={`${LAYOUT_CLASSES.InfoWrap} flex-nowrap items-center`}>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="2"
                                        value={formData.capacity}
                                        onChange={handleCapacityInput}
                                        inputClass="text-center"
                                        className="
                                            appearance-none
                                            [&::-webkit-outer-spin-button]:appearance-none
                                            [&::-webkit-inner-spin-button]:appearance-none
                                        "
                                        subTexts={[
                                            { text: "최소 2명, 최대 20명으로 모집 가능합니다.", type: "info" }
                                        ]}
                                    />
                                    <b
                                        className={[
                                        "text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)] -translate-y-3",
                                        ].join(" ")}
                                    >
                                        명
                                    </b>
                                </div>
                                {/* ▼ 감소 */}
                                <SvgIcon
                                        name="arrow-down"
                                        onClick={decCapacity}
                                        state={(Number(onlyDigitsCapacity(formData.capacity || "0")) || 0) <= 2 ? "disable" : "default"}
                                        frameSize="xs"
                                        frameClass="absolute right-5 top-[25px]"
                                        iconClass="text-[var(--color-gray-6)] w-[18px] hover:text-[var(--color-gray-8)]"
                                    />

                                {/* ▲ 증가 */}
                                <SvgIcon
                                    name="arrow-up"
                                    onClick={incCapacity}
                                    state={(Number(onlyDigitsCapacity(formData.capacity || "0")) || 0) >= 20 ? "disable" : "default"}
                                    frameSize="xs"
                                    frameClass="absolute right-5 top-[2px]"
                                    iconClass="text-[var(--color-gray-6)] w-[18px] hover:text-[var(--color-gray-8)]"
                                />
                            </div>
                        </div>
                    )}

                    {/* 7. 확인(이미지 포함) */}
                    {step === 7 && (
                        <div className={LAYOUT_CLASSES.titleAndInfoWrapper}>
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>입력하신 정보를 확인해주세요.</h2>
                            </div>
                            <ul className={`${LAYOUT_CLASSES.titleAndInfoWrapper} p-3 bg-[var(--color-gray-2)] rounded-xl`}>
                                <li className="relative z-0 w-full aspect-[3/2] overflow-hidden rounded-lg">
                                    {allPreviews.length > 0 && (
                                        <>
                                            <Swiper
                                                className="h-full"
                                                slidesPerView={1}
                                                pagination={{ clickable: true }}
                                                onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                                            >
                                                {allPreviews.map((src, i) => (
                                                    <SwiperSlide key={`${src}-${i}`}>
                                                        <img
                                                            src={src}
                                                            alt={`요리모임 이미지 ${i + 1}`}
                                                            className="absolute inset-0 w-full h-full object-cover object-center"
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            <p className="absolute right-2 bottom-2 px-2 py-1 bg-stone-700/[70%] text-white text-sm rounded-md z-10">
                                                {currentIndex + 1}/{allPreviews.length}
                                            </p>
                                        </>
                                    )}
                                </li>

                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.labelDark}>요리모임 이름</b>
                                    <p className={TEXT_CLASSES.content}>{formData.title}</p>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>상세내용</b>
                                    <p className={TEXT_CLASSES.content}>{formData.description}</p>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>요리모임 테마</b>
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        {formData.category.map((item) => (
                                            <p key={item} className={TEXT_CLASSES.tag}>{item}</p>
                                        ))}
                                    </div>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>모임할 장소</b>
                                    <p className={TEXT_CLASSES.content}>{formData.address}</p>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>모임할 일정</b>
                                    <p className={TEXT_CLASSES.content}>{formData.date}</p>
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        <p className={TEXT_CLASSES.timeTag}>{formData.timeStartLabel || formData.timeStart}</p>
                                        <b className={TEXT_CLASSES.content}>부터</b>
                                        <p className={TEXT_CLASSES.timeTag}>{formData.timeEndLabel || formData.timeEnd}</p>
                                        <b className={TEXT_CLASSES.content}>까지</b>
                                    </div>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>참가비</b>
                                    {formData.isFreeClass ? (
                                        <div className={LAYOUT_CLASSES.InfoWrap}><p className={TEXT_CLASSES.timeTag}>무료클래스</p></div>
                                    ) : (
                                        <div className={LAYOUT_CLASSES.InfoWrap}>
                                            <p className={TEXT_CLASSES.content}>{formData.fee}</p>
                                            <b className={TEXT_CLASSES.content}>원</b>
                                        </div>
                                    )}
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>참여인원</b>
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        <p className={TEXT_CLASSES.content}>{formData.capacity}</p>
                                        <b className={TEXT_CLASSES.content}>명</b>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* 8. 완료 */}
                    {step === 8 && (
                        <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-160px)] px-4 text-center">
                            <SvgIcon
                                name="check"
                                frameSize="lg"
                                iconSize="sm"
                                fill
                                hoverEffect={false}
                                frameClass="flex items-center justify-center bg-[var(--color-redorange-1)] rounded-full pointer-events-none"
                                iconClass="text-[var(--white)] translate-x-[-3px] translate-y-[-2px]"
                            />
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>수정이 완료되었습니다!</h2>
                                <p className={LAYOUT_CLASSES.subtitle}>변경된 내용을 확인해보세요.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 하단 버튼(모바일) */}
            <div className="fixed bottom-0 left-0 right-0 w-full bg-[var(--color-primary)] border-t border-[var(--color-gray-2)] desktop:hidden">
                <div className="flex gap-2 px-[16px] py-2 tablet:px-0 desktop:px-0 mx-auto desktop:justify-end max-w-[500px]">
                    {step > 0 && step !== 8 && (
                        <CustomButton
                            text="이전"
                            size="lg"
                            custombuttonClass="!w-auto desktop:w-[200px]"
                            variant="tertiary"
                            onClick={prevStep}
                            basebuttonClass="hover:bg-transparent"
                            basebuttontextClass="!text-[var(--color-gray-6)]"
                            state={isSubmitting ? "disable" : "default"}
                        />
                    )}
                    {step < steps.length - 1 && step !== 7 && step !== 8 && (
                        <CustomButton
                            text={`다음 ${step + 1}/${steps.length - 1}`}
                            size="lg"
                            basebuttonClass="w-full"
                            custombuttonClass="desktop:w-[134px]"
                            onClick={nextStep}
                            state={(isSubmitting || !isNextEnabled()) ? "disable" : "default"}
                        />
                    )}
                    {step === 7 && (
                        <CustomButton
                            text="수정하기"
                            size="lg"
                            basebuttonClass="w-full"
                            custombuttonClass="desktop:w-[134px]"
                            onClick={updatePostInPocketBase}
                            state={isSubmitting ? "disable" : "default"}
                        />
                    )}
                    {step === 8 && (
                        <CustomButton
                            text="확인하러 가기"
                            size="lg"
                            basebuttonClass="w-full"
                            custombuttonClass="desktop:w-[134px]"
                            onClick={() => navigate(`/post/detail/${postId}`, { replace: true })} // ✅ 치환 이동
                            state={isSubmitting ? "disable" : "default"}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
