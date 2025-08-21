// src/components/User/UserName.jsx
import React from "react";
import PropTypes from "prop-types";

export default function UserName({ 
    user, 
    size = "md", 
    nameClass
}) {
    if (!user?.nickname) return null;

    const sizeClasses = {
        sm: "text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm",
        md: "text-mo-title tablet:text-tab-title desktop:text-pc-title",
        lg: "text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md",
    };

    return (
        <span
            className={`${sizeClasses[size] || sizeClasses.md} whitespace-nowrap font-bold text-[var(--color-gray-8)] ${nameClass}`}
        >
            {user.nickname}
        </span>
    );
}

UserName.propTypes = {
    user: PropTypes.shape({
        nickname: PropTypes.string,
    }),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    className: PropTypes.string,
};
