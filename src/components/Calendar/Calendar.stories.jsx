import React, { useState } from "react";
import Calendar from "./Calendar";

export default {
    title: "Components/Calendar/Calendar",
    component: Calendar,
    argTypes: {
        value: { control: "text" },
        minDate: { control: "text" },
        maxDate: { control: "text" },
    },
};

const Template = (args) => {
    const [value, setValue] = useState("");
    const [month, setMonth] = useState(null);

    return (
        <div className="p-4 max-w-sm">
            <Calendar
                {...args}
                value={value}
                onChange={(ymd) => setValue(ymd)}
                month={month}
                onMonthChange={(ymd) => setMonth(ymd)}
            />
            <div className="mt-4 text-sm text-gray-600">
                선택된 날짜: {value || "없음"}
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    minDate: new Date().toISOString().slice(0, 10),
    maxDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 10),
};


