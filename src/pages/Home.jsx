import React from "react";
import ConfirmProvider from "../components/Modal/ConfirmProvider";

export default function Home() {
    return (
        <div className="
                    flex flex-col 
                    mx-auto mt-8 mb-8
                    px-4
                    tablet:px-0
                    desktop:px-0
                ">
            <h1 className="text-mo-title-lg text-[var(--color-gray-8)]">
                Home
            </h1>
            <ConfirmProvider />
        </div>
    );
}
