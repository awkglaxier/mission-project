import { useEffect, useState } from 'react';
import { fetchProgress, type PlayerProgress } from '@/lib/progress-store';

export function useProgress() {
    const [progress, setProgress] = useState<PlayerProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        fetchProgress()
            .then(setProgress)
            .catch(() => setError('load-failed'));
    };

    useEffect(() => {
        load();
    }, []);

    return { progress, error, reload: load };
}
