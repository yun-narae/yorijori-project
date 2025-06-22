import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default {
    title: 'Components/DarkModeToggle',
    component: DarkModeToggle,
};

export const On = () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    return <DarkModeToggle />;
};

export const Off = () => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    return <DarkModeToggle />;
};
