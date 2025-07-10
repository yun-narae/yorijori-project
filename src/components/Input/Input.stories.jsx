import React, { useState } from "react";
import Input from "./Input";

export default {
  title: "Components/Forms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["default", "hover", "error", "disable"],
    },
    buttonState: {
      control: { type: "select" },
      options: ["disable", "activation", "activation-hover"],
    },
    type: {
      control: { type: "select" },
      options: ["text", "password", "number", "email", "tel", "url", "search"],
    },
  },
};

const Template = (args) => {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-md">
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

// ✅ 기본
export const Default = Template.bind({});
Default.args = {
  label: "아이디",
  placeholder: "아이디를 입력해주세요",
  buttontext: "중복확인",
  state: "default",
  buttonState: "disable",
  subTexts: [
    { text: "안내 문구입니다", type: "info" },
  ],
};

export const Error = Template.bind({});
Error.args = {
  ...Default.args,
  state: "error",
  subTexts: [
    { text: "에러가 발생했습니다", type: "error" },
    { text: "안내 문구입니다", type: "info" },
  ],
};

export const WithActiveButton = Template.bind({});
WithActiveButton.args = {
  ...Default.args,
  buttonState: "activation",
};

export const Finish = Template.bind({});
Finish.args = {
  ...Default.args,
  state: "default",
  subTexts: [
    { text: "가입이 가능한 아이디입니다.", type: "finish" },
  ],
  buttonState: "activation",
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  state: "disable",
  buttonState: "disable",
};
