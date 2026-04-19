import { useState, useEffect, useCallback } from 'react';

export const useOtpTimer = (initialTime = 30) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (interval) clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startTimer = useCallback(() => {
        setTimeLeft(initialTime);
        setIsActive(true);
    }, [initialTime]);

    // Returns a formatted string like "00:29" for the UI
    const formattedTime = `00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}`;

    return { timeLeft, isTimerActive: isActive, startTimer, formattedTime };
};