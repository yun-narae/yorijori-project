import React, { useState } from "react";
import PropTypes from "prop-types";
import RadioListItem from "../RadioListItem/RadioListItem";
import SelectImage from "./SelectImage";

export default function SelectImageGroup({
    title = "",
    radioOptions = [],
    selectedValue,
    onChangeValue,
    imageUrl,
    onSelectImage,
    RadioListItemclassName,
    SelectImageclassName,
    state = "default", // ✅ 공통 상태
}) {
    return (
        <div className="w-full">
            {title && (
                <h3 className="mb-2 font-bold text-[var(--color-gray-8)]">
                    {title}
                </h3>
            )}

            <RadioListItem
                options={radioOptions}
                name="select-image-group"
                value={selectedValue}
                onChange={onChangeValue}
                RadioListItemclassName={RadioListItemclassName}
                state={state === "disable" ? "disable" : selectedValue === "checked" ? "checked" : state}
            />

            {selectedValue === "checked" && (
                <SelectImage
                    imageUrl={imageUrl}
                    onSelectImage={onSelectImage}
                    className={SelectImageclassName}
                    state={state}
                />
            )}
        </div>
    );
}

SelectImageGroup.propTypes = {
    title: PropTypes.string,
    radioOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            label: PropTypes.string,
        })
    ),
    selectedValue: PropTypes.string.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    imageUrl: PropTypes.string,
    onSelectImage: PropTypes.func.isRequired,
    RadioListItemclassName: PropTypes.string,
    SelectImageclassName: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable", "checked"]),
};
