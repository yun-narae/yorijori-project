import React from "react";
import Skel from "./Skel";
import PostCardSkeleton from "./PostCardSkeleton";

const CATEGORIES = [
    "한식", "중식", "일식", "양식", "베이킹", "디저트", "기타"
];

export default function CategoryPageSkeleton() {
    return (
        <>
            <div className="flex flex-col gap-4 max-w-[500px] mx-auto mt-6 desktop:mt-8 mb-8 px-4 tablet:px-0 desktop:px-0">
                <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {CATEGORIES.map((category) => (
                        <div key={category} className="flex-shrink-0">
                            <Skel className="h-10 w-16 !rounded-full" />
                        </div>
                    ))}
                </div>
                <PostCardSkeleton
                    variant="simple"
                    className="!max-w-none !mx-0 !mt-auto !mb-auto !px-0"
                />
            </div>
        </>
    );
}
