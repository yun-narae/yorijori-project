import React, { useState } from "react";
import DateInput from "./DateInput";

export default {
    title: "Components/Calendar/DateInput",
    component: DateInput,
    argTypes: {
        maxDate: { control: "text" },
    },
};

const Template = (args) => {
    const [value, setValue] = useState("");

    return (
        <div className="p-4 max-w-sm">
            <DateInput
                {...args}
                value={value}
                onChange={(ymd) => setValue(ymd)}
            />
            <div className="mt-4 text-sm text-gray-600">
                선택된 날짜: {value || "없음"}
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 10),
};


