import { Link } from 'react-router-dom';
import BaseButton from '../components/BaseButton/BaseButton';

export default function Home() {
    return (
        <div className="
                    flex flex-col 
                    mx-auto mt-8 mb-8
                    px-4
                    tablet:px-0
                    desktop:px-0
                ">
            <h1 className="text-mo-title-lg text-[var(--color-gray-8)]">
                Home
            </h1>
        </div>
    );
}
