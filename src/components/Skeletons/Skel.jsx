import React from "react";

const Skel = ({ className = "" }) => {
    return (
        <div className={`skeleton rounded-md ${className}`} />
    )
}

export default Skel