import React, { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import ConfirmProvider from "../Modal/ConfirmProvider";
import TimeInput from "./TimeInput";

export default {
    title: "Components/TimeWheelPicker/TimeInput",
    component: TimeInput,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <AuthProvider>
                    <ConfirmProvider>
                        <div className="p-4">
                            <Story />
                        </div>
                    </ConfirmProvider>
                </AuthProvider>
            </MemoryRouter>
        ),
    ],
    argTypes: {
        value: { control: "text" },
        minTime: { control: "text" },
        step: { control: { type: "range", min: 5, max: 60, step: 5 } },
    },
};

export const TwoInputs = () => {
    const [startTime, setStartTime] = useState("14:00");
    const [endTime, setEndTime] = useState("16:00");

    return (
        <div className="flex items-center gap-4">
            <TimeInput
                value={startTime}
                onChange={setStartTime}
                minTime="09:00"
                step={10}
            />
            <div className="flex items-center text-gray-500">
                <span className="text-lg">~</span>
            </div>
            <TimeInput
                value={endTime}
                onChange={setEndTime}
                minTime={startTime}
                step={10}
            />
        </div>
    );
};