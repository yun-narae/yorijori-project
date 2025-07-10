import React from "react";
import PropTypes from "prop-types";

const BUTTON_STATE_CLASSES = {
    activation: "text-[var(--color-blue-1)] hover:text-[var(--color-blue-2)] transition",
    "activation-hover": "text-[var(--color-blue-2)]",
    disable: "text-[var(--color-gray-4)] cursor-not-allowed",
};

export default function InputButton({ text, state, onClick }) {
    const stateClass = BUTTON_STATE_CLASSES[state] || BUTTON_STATE_CLASSES.disable; // default값 disable

    return (
        <button
            type="button"
            disabled={state === "disable"}
            onClick={state === "disable" ? undefined : onClick}
            className={`
                whitespace-nowrap
                font-bold
            ${stateClass}
            `}
        >
            {text}
        </button>
    );
}

InputButton.propTypes = {
    text: PropTypes.string.isRequired,
    state: PropTypes.oneOf(["activation", "activation-hover", "disable"]),
    onClick: PropTypes.func,
};
