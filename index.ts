// Import stylesheets
import './style.css';
import Interactivity from './Interactivity';

const interactivity = Interactivity.create({
    element: 'lottie-player',
    interactionType: 'hover',
    animationType: 'lottie',
    interactionSettings: {
        hoverOutAction: 'reverse'
    },
    steps: [
        {
            mode: 'play',
            animationParams: {
                speed: 1,
                playMode: 'bounce',
                loop: true,
                path: 'https://assets3.lottiefiles.com/packages/lf20_gg6O6arGFb.json',
            },
            id: 1
        },
        {
            mode: 'play',
            animationParams: {
                // playMode: 'bounce',
                speed: 1.5,
                path: 'https://assets3.lottiefiles.com/packages/lf20_VlZLHdGeu6.json',
            },
            transition: {
                trigger: 'complete',
                jumpToStep: 0,
            },
            id: 2
        },
        {
            mode: 'play',
            animationParams: {
                // playMode: 'bounce',
                // direction: 'backward',
                speed: 3,
                path: 'https://assets7.lottiefiles.com/packages/lf20_k0sUtnckyH.json',
            },

            transition: {
                trigger: 'complete',
                jumpToStep: 0,
            },
            id: 3
        },
        {
            mode: 'play',
            animationParams: {
                loop: true,
                path: 'https://assets7.lottiefiles.com/packages/lf20_ZsO4t2Bow2.json',
            },
        },
    ],
});

console.log(interactivity);
