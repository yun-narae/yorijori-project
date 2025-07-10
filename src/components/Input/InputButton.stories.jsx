import React from "react";
import InputButton from "./InputButton";

export default {
  title: "Components/Forms/InputButton",
  component: InputButton,
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["activation", "activation-hover", "disable"],
    },
    text: { control: "text" },
  },
};

const Template = (args) => (
  <div className="w-full max-w-md">
    <InputButton {...args} />
  </div>
);

export const Activation = Template.bind({});
Activation.args = {
  text: "중복 확인",
  state: "activation",
};

export const ActivationHover = Template.bind({});
ActivationHover.args = {
  text: "중복 확인",
  state: "activation-hover",
};

export const Disabled = Template.bind({});
Disabled.args = {
  text: "중복 확인",
  state: "disable",
};
