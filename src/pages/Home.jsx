import { Link } from 'react-router-dom';
import BaseButton from '../components/BaseButton/BaseButton';

export default function Home() {
  return (
    <div>
        <h1 className="text-mo-title-lg text-[var(--color-gray-8)]">Home</h1>
        <BaseButton text="수정하기" size="sm" iconName="plus"></BaseButton>
        -
        <BaseButton type="secondary" size="md" text="수정하기" iconName="plus"></BaseButton>
        -
        <BaseButton type="tertiary" state="disable" size="lg" text="수정하기" iconName="plus"></BaseButton>
    </div>
  );
}
