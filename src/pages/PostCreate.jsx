import React, { useState } from "react";

const steps = [1, 2, 3, 4, 5, 6, 7, 8];

export default function PostCreate() {
    const [step, setStep] = useState(0);

    const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    return (
        <>
            <div className="
                flex flex-col
                max-w-[500px] mx-auto mt-8 mb-8
                px-4
                tablet:px-0
                desktop:px-0
            ">
                <h2 className="text-lg font-bold">게시물 작성 ({step + 1}/{steps.length})</h2>
                {/* ✅ Step 구간 */}
                {step === 0 &&
                    <>
                        1페이지: 제목 입력 & 무료 클래스 여부
                    </>
                }
                {step === 1 &&
                    <>
                        2페이지: 카테고리 선택
                    </>
                }
                {step === 2 &&
                    <>
                        3페이지: 내용 입력 & 이미지 업로드
                    </>
                }
                {step === 3 &&
                    <>
                        4페이지: 장소 설정
                    </>
                }
                {step === 4 &&
                    <>
                        5페이지: 일정(날짜 & 시간) 설정
                    </>
                }
                {step === 5 &&
                    <>
                        6페이지: 참가비 설정
                    </>
                }
                {step === 6 &&
                    <>
                        7페이지: 인원 설정
                    </>
                }
                {step === 7 && (
                    <>
                        8페이지: 입력한 정보 확인 & 최종 제출
                        <button
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
                        >
                            게시물 등록
                        </button>
                    </>
                )}
                {/* ✅ 버튼 */}
                <div className="flex justify-between gap-2 mt-6">
                    {step > 0 && (
                        <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">
                            이전
                        </button>
                    )}
                    {step < steps.length - 1 && (
                        <button onClick={nextStep} className="px-4 py-2 bg-blue-500 text-white rounded">
                            다음
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}