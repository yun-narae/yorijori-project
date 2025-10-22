import React, { useState } from "react";
import TimeWheelPicker from "./TimeWheelPicker";

export default {
    title: "Components/TimeWheelPicker/TimeWheelPicker",
    component: TimeWheelPicker,
    argTypes: {
        format: {
            control: { type: "select" },
            options: ["12h", "24h"],
        },
        minuteStep: {
            control: { type: "number" },
        },
    },
};

const Template = (args) => {
    const [value, setValue] = useState("14:00");

    return (
        <div className="p-4">
            <TimeWheelPicker
                {...args}
                value={value}
                onChange={setValue}
            />
            <div className="mt-4 text-sm text-gray-600">
                선택된 시간: {value}
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    format: "12h",
    minuteStep: 10,
};