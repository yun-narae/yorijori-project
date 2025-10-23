import CategorySelectBadge from "./CategorySelectBadge";

export default {
    title: "Components/Badges/CategorySelectBadge",
    component: CategorySelectBadge,
    parameters: {
        layout: "centered",
    },
    argTypes: {
        label: {
            control: "text",
            description: "표시할 카테고리명",
        },
        isSelected: {
            control: "boolean",
            description: "선택된 상태인지",
        },
        disabled: {
            control: "boolean",
            description: "비활성화 상태",
        },
        onClick: {
            action: "clicked",
            description: "클릭 핸들러",
        },
    },
};

const Template = (args) => <CategorySelectBadge {...args} />;

export const Default = Template.bind({});
Default.args = {
    label: "한식",
    isSelected: false,
    disabled: false,
};

export const Selected = Template.bind({});
Selected.args = {
    label: "양식",
    isSelected: true,
    disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
    label: "일식",
    isSelected: false,
    disabled: true,
};

export const SelectedDisabled = Template.bind({});
SelectedDisabled.args = {
    label: "브런치",
    isSelected: true,
    disabled: true,
    disabled: true,
};

export const Multiple = () => (
    <div className="flex flex-wrap gap-2">
        <CategorySelectBadge label="한식" isSelected={false} />
        <CategorySelectBadge label="양식" isSelected={true} />
        <CategorySelectBadge label="일식" isSelected={false} />
        <CategorySelectBadge label="브런치" isSelected={true} />
        <CategorySelectBadge label="중식" isSelected={false} />
        <CategorySelectBadge label="분식" isSelected={false} />
        <CategorySelectBadge label="베이킹" isSelected={true} />
    </div>
);

Multiple.parameters = {
    docs: {
        description: {
            story: "여러 카테고리 배지를 함께 사용하는 예시입니다.",
        },
    },
};
