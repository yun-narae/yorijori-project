import React from "react";

/** 공통 스켈렉톤 블록 */
const Skel = ({ className = "" }) => (
    <div className={`skeleton rounded-md ${className}`} />
);

/** step: 0,2,3,4,5,6 / 1 / 7 / 8 */
export default function PostCreateSkeleton({ step = 0 }) {
    if (step === 1) return <Step01 />;
    if (step === 7) return <Step07 />;
    if (step === 8) return <Step08 />;
    return <StepDefault />;
}

/** step 0,2,3,4,5,6 공통 */
function StepDefault() {
    return (
        <>
            <div className="px-4 tablet:px-0 desktop:px-0 max-w-[500px] mx-auto">
                <div className="flex flex-col gap-6 mt-8 mb-24">
                    <div className="flex flex-col gap-3">
                        <Skel className="h-5 w-2/3" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Skel className="h-4 w-1/2" />
                        <Skel className="h-4 w-2/3" />
                        <Skel className="h-4 w-1/3" />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
}

/** step 1 */
function Step01() {
    return (
        <>
            <div className="px-4 tablet:px-0 desktop:px-0 max-w-[500px] mx-auto">
                <div className="flex flex-col gap-6 mt-8 mb-24">
                    <div className="flex flex-col gap-3">
                        <Skel className="h-5 w-2/3" />
                    </div>

                    <div className="flex flex-wrap gap-1 items-center">
                            <Skel className="h-6 w-7 !rounded-full" />
                            <Skel className="h-6 w-7 !rounded-full" />
                            <Skel className="h-6 w-7 !rounded-full" />
                            <Skel className="h-6 w-7 !rounded-full" />
                            <Skel className="h-6 w-7 !rounded-full" />
                            <Skel className="h-6 w-7 !rounded-full" />
                            <Skel className="h-6 w-7 !rounded-full" />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
}

/** setp 7단계(미리보기) */
function Step07() {
    return (
        <>
            <div className="px-4 tablet:px-0 desktop:px-0 max-w-[500px] mx-auto mt-8 mb-24">
                <div className="flex flex-col gap-4">
                    <Skel className="h-5 w-2/3" />
                    <div className="p-3 rounded-xl bg-[var(--color-gray-2)]">
                        <Skel className="w-full aspect-[3/2] rounded-lg" />
                        <div className="flex flex-col gap-3 mt-4">
                            <Skel className="h-4 w-1/2" />
                            <Skel className="h-4 w-2/3" />
                            <Skel className="h-4 w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
}

/** 8단계(완료 화면) */
function Step08() {
    return (
        <>
            <div className="mt-8 mb-8">
                <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-160px)]
 px-4 text-center">
                    <Skel className="h-16 w-16 !rounded-full" />
                    <Skel className="h-5 w-48" />
                    <Skel className="h-4 w-60" />
                </div>
            </div>
            <BottomBar />
        </>
    );
}

/** 하단 고정 버튼 스켈레톤 */
function BottomBar() {
    return (
        <div className="
            fixed bottom-0 left-0 right-0 
            w-full
            bg-[var(--color-primary)]
            border-t border-[var(--color-gray-2)]
            desktop:hidden
        ">
            <div className="px-4 py-2 mx-auto max-w-[500px]">
                <Skel className="h-12 w-full rounded-md" />
            </div>
        </div>
    );
}
