import React from "react";
import PropTypes from "prop-types";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function SelectImageDeleteButton({
  onClick,
  state = "default",
}) {
    return (
        <div
            className={[
                "absolute top-1 right-1 flex items-center justify-center",
                "w-[16px] h-[16px] rounded-full border transition",
                "bg-[var(--color-gray-1)]",
                "border border-[var(--color-gray-2)]",
                state === "hover"
                ? "bg-[var(--color-gray-9)] "
                : "hover:bg-[var(--color-gray-2)] hover:border-[var(--color-gray-3)]",
            ].join(" ")}
        >
            <SvgIcon 
                type="button"
                onClick={onClick}
                name="delete"
                iconClass="w-[10px] h-[10px]"
            />
        </div>
    );
}

SelectImageDeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  state: PropTypes.oneOf(["default", "hover"]),
};
