import React, { useState, useEffect } from "react";
import pb from "../lib/pocketbase";
import Input from "../components/Input/Input";
import RadioListItem from "../components/RadioListItem/RadioListItem";
import CustomButton from "../components/CustomButton/CustomButton";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import SelectImageGroup from "../components/SelectImageGroup/SelectImageGroup";
import SvgIcon from '../components/SvgIcon/SvgIcon';
import Header from "../components/Header/Header";
import useProfileImages from "../hooks/useProfileImages";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import TimeInput from "../components/TimeWheelPicker/TimeInput";

const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const LAYOUT_CLASSES = {
    title: "text-[var(--color-gray-8)] font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg",
    subtitle: "font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)]",
    Wrapper: "flex flex-col gap-6",
    titleWrapper: "flex flex-col gap-1",
    InfoWrapper: "flex flex-col gap-3",
    titleAndInfoWrapper: "flex flex-col gap-3",
    InfoWrap: "flex flex-wrap gap-2 items-center",
};

const TEXT_CLASSES = {
    label: "text-[var(--color-gray-7)] font-bold",
    labelDark: "text-[var(--color-gray-8)] font-bold",
    content: "text-[var(--color-gray-6)]",
    tag: "text-mo-text tablet:text-tab-text desktop:text-pc-text px-3 py-1 rounded-full bg-[var(--color-gray-1)] text-[var(--color-gray-7)]",
    timeTag: "px-2 py-1 rounded bg-[var(--color-gray-1)] text-[var(--color-gray-7)]"
};

// 2페이지 카테고리 관련
const categories = ["한식", "양식", "일식", "브런치", "중식", "분식", "베이킹"];

const CATEGORY_BASE = "transparent px-4 py-2 w-min whitespace-nowrap text-mo-button tablet:text-tab-button desktop:text-pc-button font-bold rounded-full transition"

const CATEGORY_STATE = {
    default: "text-[var(--color-gray-7)] bg-[var(--color-gray-1) border border-[var(--color-gray-2)] hover:border-[var(--color-gray-6)]",
    select: "border border-[var(--color-redorange-2)] text-[var(--color-redorange-2)] hover:bg-[var(--color-gray-2)]"
}

export default function PostCreate() {
    // 상태
    const [step, setStep] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    const [selectedValue, setSelectedValue] = useState("default");
    const { images, handleAddImage, handleRemoveImage } = useProfileImages(3);
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
        fee: "",
        capacity: "",
    });

    // 사용자
    const user = pb.authStore.model;
    const userId = user?.id;

    // 반응형 대응
    useEffect(() => {
        const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    // 스텝 이동
    const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

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

    // PocketBase 저장
    const savePostToPocketBase = async () => {
        try {
            const form = new FormData();
            form.append("title", formData.title);
            form.append("editor", userId);
            form.append("description", formData.description);
            form.append("location", formData.address);
            form.append("date", formData.date);
            form.append("timeStart", formData.timeStart);
            form.append("timeEnd", formData.timeEnd);
            form.append("fee", formData.fee);
            form.append("capacity", formData.capacity);

            formData.category.forEach((cat) => form.append("category", cat));

            images.forEach((file) => {
                if (file instanceof File) {
                    form.append("images", file);
                }
            });

            const record = await pb.collection("post").create(form);
            console.log("저장 성공:", record);
            nextStep();
        } catch (error) {
            console.error("저장 실패:", error);
        }
    };

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
                            },
                            step < steps.length - 1 && step !== 7 && step !== 8 && {
                                text: `다음 ${step + 1}/${steps.length}`,
                                size: "md",
                                variant: "primary",
                                onClick: nextStep,
                                custombuttonClass: "desktop:w-[100px]"
                            },
                            step == 7 && {
                                text: "요리모임 등록하기",
                                size: "md",
                                variant: "primary",
                                basebuttonClass: "w-full",
                                custombuttonClass: "desktop:w-[134px]",
                                onClick: savePostToPocketBase
                            },
                            step == 8 && {
                                text: "확인하러 가기",
                                size: "md",
                                variant: "primary",
                                basebuttonClass: "w-full",
                                custombuttonClass: "desktop:max-w-[134px]"
                            }
                        ].filter(Boolean)
                        : undefined
                }
            />

            {step !== 8 && 
                <PageTitleBar 
                    showBackButton={false}
                    className="!mt-28"
                />
            }

            <div
                className={[
                    "relative",
                    "h-auto",
                    "flex flex-col max-w-[500px] mx-auto",
                    "px-4 tablet:px-0 desktop:px-0",
                    "mt-8 mb-8"
                ].join(" ")}
            >
                {/* ✅ Step 구간 */}
                {step === 0 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.Wrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                                <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                    <h2 className={LAYOUT_CLASSES.title}>
                                        요리모임의 이름을 지어주세요!
                                    </h2>
                                </div>
                                <div>
                                <Input
                                    placeholder="최대 40자까지 가능해요."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                </div>
                            </div>
                            <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <h2 className={LAYOUT_CLASSES.title}>
                                        해당 모임은 무료클래스 인가요?
                                    </h2>
                                    <p className={LAYOUT_CLASSES.subtitle}>무료클래스일 경우 참가비를 설정하실 수 없습니다.</p>
                                </div>
                                <RadioListItem
                                    options={[
                                        { value: "option1", label: "아니오" },
                                        { value: "option2", label: "예" },
                                    ]}
                                    value="option1"
                                    onChange=""
                                    state="default"
                                />
                            </div>
                        </div>
                    </>
                }
                {step === 1 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    어떤 테마의 모임을 하시나요?
                                </h2>
                                <p className={LAYOUT_CLASSES.subtitle}>최대 3개까지 선택할 수 있어요.</p>
                            </div>
                            <div className={`${LAYOUT_CLASSES.InfoWrap}`}>
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
                    </>
                }
                {step === 2 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.Wrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <h2 className={LAYOUT_CLASSES.title}>
                                        요리모임에 대해 소개해주세요.
                                    </h2>
                                </div>
                                <Input
                                    placeholder="최대 1000자까지 가능해요."
                                    name="요리모임에 대한 소개"
                                    textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <p className={LAYOUT_CLASSES.subtitle}>모임을 잘 나타낼 수 있는 사진을 골라주세요.</p>
                                </div>
                                <SelectImageGroup
                                    title="요리모임 이미지 선택"
                                    selectedValue={selectedValue}
                                    onChangeValue={(value) => {
                                        if (value === "default") handleRemoveImage(undefined, true);
                                        setSelectedValue(value);
                                    }}
                                    images={images}
                                    onAddImage={handleAddImage}
                                    onRemoveImage={handleRemoveImage}
                                    radioOptions={[
                                        { value: "default", label: "기본 이미지" },
                                        { value: "checked", label: "선택 이미지" },
                                    ]}
                                    state="default"
                                    hideRadioList= {true}
                                />
                            </div>
                        </div>
                    </>
                }
                {step === 3 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    요리 모임할 장소를 입력해주세요.
                                </h2>
                                <p className={LAYOUT_CLASSES.subtitle}>잠깐! 공간 예약 확정 후 장소 정보를 입력해주세요!</p>
                            </div>
                            <div className="relative">
                                <Input
                                    type="address"
                                    placeholder="장소를 검색하세요"
                                    buttontext="장소 찾기"
                                    buttonState="activation"
                                    inputClass= "translate-x-4 mr-4"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                <SvgIcon 
                                    name= "mapPin"
                                    frameClass= "absolute left-1 top-1 pointer-events-none"
                                    iconClass= "text-[var(--color-gray-5)]"
                                />
                            </div>
                        </div>
                    </>
                }
                {step === 4 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.Wrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                                <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                    <h2 className={LAYOUT_CLASSES.title}>
                                        요리 모임의 일정을 정해주세요!
                                    </h2>
                                    <p className={LAYOUT_CLASSES.subtitle}>모임할 날짜를 선택해주세요.</p>
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder= "모임 날짜를 선택해주세요."
                                        inputClass= "translate-x-4 mr-4"
                                    />
                                    <SvgIcon
                                        name= "calendar"
                                        frameClass= "absolute left-1 top-1 pointer-events-none"
                                        iconClass= "text-[var(--color-gray-5)]"
                                    />
                                </div>
                            </div>
                            <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                                <div className={LAYOUT_CLASSES.titleWrapper}>
                                    <p className={LAYOUT_CLASSES.subtitle}>모임할 시간을 선택해주세요.</p>
                                </div>
                                <div className={LAYOUT_CLASSES.InfoWrap}>
                                    <TimeInput
                                        value={formData.timeStart}
                                        onChange={(val, label) =>                // 두 번째 인자로 라벨 받음
                                        setFormData(s => ({ ...s, timeStart: val, timeStartLabel: label }))
                                      }
                                        step={10}
                                    />
                                    <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)]">부터</b>

                                    <TimeInput
                                        value={formData.timeEnd}
                                        minTime={formData.timeStart || undefined}
                                        onChange={(val, label) =>
                                            setFormData(s => ({ ...s, timeEnd: val, timeEndLabel: label }))
                                        }
                                        step={10}
                                    />
                                    <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)]">
                                        까지
                                    </b>
                                </div>
                            </div>
                        </div>
                    </>
                }
                {step === 5 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    참가비를 입력해주세요.
                                </h2>
                            </div>
                            <div className={`${LAYOUT_CLASSES.InfoWrap} flex-nowrap`}>
                                <Input
                                    placeholder= "10,000"
                                    value= "10,000"
                                    inputClass= "text-center"
                                    subTexts= {
                                        [{ text: "최소 10,000원부터 가능합니다.", type: "info" }]
                                    }
                                />
                                <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)] -translate-y-2">
                                    원
                                </b>
                            </div>
                        </div>
                        {/* 1페이지에서 무료클래스 선택 시 */}
                        <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    해당 모임은 무료클래스 입니다.
                                </h2>
                                <p className={LAYOUT_CLASSES.subtitle}>참가비가 발생하지 않습니다.</p>
                            </div>
                            <div className={`${LAYOUT_CLASSES.InfoWrap} flex-nowrap`}>
                                <Input
                                    value= "0"
                                    inputClass= "text-center text-[var(--color-gray-6)]"
                                    state="disable"
                                />
                                <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)]">
                                    원
                                </b>
                            </div>
                        </div>
                    </>
                }
                {step === 6 &&
                    <>
                        <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    모임할 인원을 입력해주세요.
                                </h2>
                            </div>
                            <div className="relative">
                                <div className={`${LAYOUT_CLASSES.InfoWrap} flex-nowrap`}>
                                    <Input
                                        value= "2"
                                        inputClass= "text-center"
                                        subTexts= {
                                            [{ text: "최소 2명부터 가능합니다.", type: "info" }]
                                        }
                                    />
                                    <b className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-7)] -translate-y-2">
                                        명
                                    </b>
                                </div>
                                <SvgIcon
                                    name= "arrow-down"
                                    frameClass= "absolute right-5 top-3"
                                    iconClass= "text-[var(--color-gray-6)] w-[18px]"
                                />
                                <SvgIcon
                                    name= "arrow-up"
                                    frameClass= "absolute right-5 top-[-3px]"
                                    iconClass= "text-[var(--color-gray-6)] w-[18px]"
                                />
                            </div>
                        </div>
                    </>
                }
                {step === 7 && (
                    <>
                        <div className={`${LAYOUT_CLASSES.titleAndInfoWrapper}`}>
                            <div className={`${LAYOUT_CLASSES.titleWrapper}`}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    입력하신 정보를 확인해주세요.
                                </h2>
                            </div>
                            <ul className={`${LAYOUT_CLASSES.titleAndInfoWrapper} p-3 bg-[var(--color-gray-2)] rounded-xl`}>
                                <li className="relative bg-green-500 z-0 w-full aspect-[3/2] overflow-hidden rounded-lg">
                                    {images.length > 0 && (
                                        <>
                                            <Swiper
                                                className="h-full"
                                                slidesPerView={1}
                                                pagination={{ clickable: true }}
                                                onSlideChange={(swiper) => {
                                                    setCurrentIndex(swiper.activeIndex);
                                                
                                                    if (images.length === 1) {
                                                        // 이미지가 하나뿐이면 양방향 모두 막기
                                                        swiper.allowSlidePrev = false;
                                                        swiper.allowSlideNext = false;
                                                        return;
                                                    }
                                                
                                                    // 첫 번째 슬라이드일 때 왼쪽 막기
                                                    if (swiper.activeIndex === 0) {
                                                        swiper.allowSlidePrev = false;
                                                    } else {
                                                        swiper.allowSlidePrev = true;
                                                    }
                                                
                                                    // 마지막 슬라이드일 때 오른쪽 막기
                                                    if (swiper.activeIndex === images.length - 1) {
                                                        swiper.allowSlideNext = false;
                                                    } else {
                                                        swiper.allowSlideNext = true;
                                                    }
                                                }}
                                            >
                                                {images.map((file, index) => (
                                                    <SwiperSlide key={index}>
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`요리모임 이미지 ${index + 1}`}
                                                            className="absolute inset-0 w-full h-full object-cover object-center"
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>

                                            {images.length && (
                                                <p className="absolute right-2 bottom-2 px-2 py-1 bg-stone-700/[70%] text-white text-sm rounded-md z-10">
                                                    {currentIndex + 1}/{images.length}
                                                </p>
                                            )}
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
                                    <p className={TEXT_CLASSES.content}>2025년 7월 26일</p>
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        <p className={TEXT_CLASSES.timeTag}>{formData.timeStartLabel || formData.timeStart}</p>
                                        <b className={TEXT_CLASSES.content}>부터</b>
                                        <p className={TEXT_CLASSES.timeTag}>{formData.timeEndLabel || formData.timeEnd}</p>
                                        <b className={TEXT_CLASSES.content}>까지</b>
                                    </div>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>참가비</b>
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        <p className={TEXT_CLASSES.content}>10,000</p>
                                        <b className={TEXT_CLASSES.content}>원</b>
                                    </div>
                                    {/* 무료클래스일 경우 */}
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        <p className={TEXT_CLASSES.timeTag}>무료클래스</p>
                                    </div>
                                </li>
                                <li className={LAYOUT_CLASSES.titleWrapper}>
                                    <b className={TEXT_CLASSES.label}>참여인원</b>
                                    <div className={LAYOUT_CLASSES.InfoWrap}>
                                        <p className={TEXT_CLASSES.content}>10</p>
                                        <b className={TEXT_CLASSES.content}>명</b>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
                {step === 8 && (
                    <>
                        <div className="
                            flex flex-col gap-4 items-center justify-center
                            min-h-[calc(100vh-160px)]
                            px-4 text-center
                        ">
                            <SvgIcon 
                                name="check" 
                                frameSize="lg" 
                                iconSize="sm" 
                                fill
                                hoverEffect={false}
                                frameClass="
                                    flex items-center justify-center
                                    bg-[var(--color-redorange-1)] rounded-full
                                    pointer-events-none
                                " 
                                iconClass="text-[var(--white)] translate-x-[-3px] translate-y-[-2px]"
                            />
                            
                            <div className={LAYOUT_CLASSES.titleWrapper}>
                                <h2 className={LAYOUT_CLASSES.title}>
                                    요리 모임 생성이 완료되었어요!
                                </h2>
                                <p className={LAYOUT_CLASSES.subtitle}>
                                    모임의 그룹원을 모으고 즐겁게 모임을 진행해요
                                </p>
                            </div>
                        </div>
                    </>
                )}
                
                {/* ✅ 버튼 */}
                <div className="
                    fixed bottom-0 left-0 right-0 
                    w-full
                    bg-[var(--color-primary)]
                    border-t border-[var(--color-gray-2)]
                    desktop:hidden
                    ">
                    <div className="
                        flex gap-2
                        px-4 py-2 tablet:px-0 desktop:px-0 mx-auto
                        desktop:justify-end
                        max-w-[500px]
                        ">
                        {step > 0 && step !== 8 &&  (
                            <CustomButton
                                text="이전"
                                size="lg"
                                variant="tertiary"
                                custombuttonClass="!w-auto desktop:w-[200px]"
                                onClick={prevStep}
                                basebuttonClass="hover:bg-transparent"
                                basebuttontextClass="!text-[var(--color-gray-6)] "
                            />
                        )}
                        {step < steps.length - 1 && step !== 7 && step !== 8 && (
                            <CustomButton
                                text={`다음 ${step + 1}/${steps.length - 1}`}
                                size="lg"
                                basebuttonClass="w-full"
                                custombuttonClass="desktop:w-[134px]"
                                onClick={nextStep}
                            />
                        )}
                        {step == 7 && (
                            <CustomButton
                                text="요리모임 등록하기"
                                size="lg"
                                basebuttonClass="w-full"
                                custombuttonClass="desktop:w-[134px]"
                                onClick={savePostToPocketBase}
                            />
                        )}
                        {step == 8 && (
                            <CustomButton
                                text="확인하러 가기"
                                size="lg"
                                basebuttonClass="w-full"
                                custombuttonClass="desktop:w-[134px]"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}