import { useState } from "react";

export function useLocalStorage(key, initialValue) {
    const [value, setValue ] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : initialValue;
    });
    
    const setLocalStorage = (newValue) => {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
    };

    return [value, setLocalStorage];    
}