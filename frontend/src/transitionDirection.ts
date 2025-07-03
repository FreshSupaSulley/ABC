// src/utils/transitionDirection.ts

let currentDirection: 'left' | 'right' = 'left';
let prevLocation = '/';

export function setPrevLocation(path: string) {
    prevLocation = path;
}

export function getPrevLocation() {
    return prevLocation;
}

export function setTransitionDirection(dir: 'left' | 'right') {
    currentDirection = dir;
}

export function getTransitionDirection() {
    console.log(currentDirection);
    return currentDirection;
}
