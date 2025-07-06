import React from "react";
import PropTypes from "prop-types";
import SelectImage from "./SelectImage";

export default function SelectImageList({
  images = [],
  onAddImage,
  onRemoveImage,
  SelectImageclassName = "",
  state = "default",
  maxCount = 3,
}) {
  const showUploadButton = images.length < maxCount;

  return (
    <div className="flex gap-2 flex-wrap">
        {showUploadButton && (
            <label htmlFor="group-upload">
                <SelectImage
                    imageUrl=""
                    onSelectImage={() => document.getElementById("group-upload").click()}
                    className={SelectImageclassName}
                    state={state}
                />
                <input
                    id="group-upload"
                    type="file"
                    accept="image/*"
                    onChange={onAddImage}
                    className="hidden"
                />
            </label>
        )}

        {images.map((image, index) => (
            <SelectImage
                key={index}
                imageUrl={image}
                onSelectImage={() => {}}
                onRemoveImage={() => onRemoveImage(index)}
                isRemovable
                className={SelectImageclassName}
                state={state}
            />
        ))}
    </div>
  );
}

SelectImageList.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddImage: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  SelectImageclassName: PropTypes.string,
  state: PropTypes.oneOf(["default", "hover", "disable", "checked"]),
  maxCount: PropTypes.number,
};
