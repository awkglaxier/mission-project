import { createContext, useContext } from 'react';

/** Shared "is this control hovered or pressed" state for Animate UI style icons. */
export const IconActiveContext = createContext(false);

export function useAnimatedIconActive() {
    return useContext(IconActiveContext);
}
