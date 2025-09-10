// src/pages/Home.jsx
import React from "react";
import RecentPosts from "../components/HomeSections/RecentPosts";

export default function Home() {
    return (
        <main
            className="
                flex flex-col gap-10
                max-w-[1060px] mx-auto mt-8 mb-8
                px-[16px] desktop:px-0
            "
        >
            <RecentPosts />
        </main>
    );
}
