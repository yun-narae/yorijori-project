import React from "react";

export const Button = ({
}) => {
  const buttonClasses = "inline-block rounded border px-12 py-3 text-sm font-medium focus:outline-none"
  return (
    <>
        <button className="switch-shadow text-[var(--color-red-1)] p-4 mobile:bg-white tablet:bg-blue-100 desktop:bg-green-100">Test</button>
    </>
  );
};