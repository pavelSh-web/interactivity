import {
    InteractionOptions,
    InteractionType,
    AnimationType,
    AnimationParamsConfig,
    InteractionStep,
    InteractionSettings,
} from './typings.d';

import { inRange } from './helpers';
import InteractivityLottieModule from './InteractivityLottieModule';

const animationModules = {
    lottie: InteractivityLottieModule,
};

// type InteractivityState = {
//     activeStep?: number;
//     activeStepProgress?: number;
//     totalProgress: number;
//     stepWaitTransition: boolean;
// }

type Step = InteractionStep & {
    animation: any,
    isActive: boolean,
    inPlay: boolean,
    isCompleted: boolean
};

export default class Interactivity {
    options: InteractionOptions;
    element: HTMLElement;
    interactionType: InteractionType;
    interactionSettings: InteractionSettings;
    animationType: AnimationType;
    defaultStepSettings: AnimationParamsConfig[keyof AnimationParamsConfig];
    steps: Step[];
    animationModule: any; // TODO pashtet описать тип
    activeStep: Step;
    activeStepIndex: number;
    stepsInited: boolean;

    static create(options: InteractionOptions) {
        return new Interactivity(options);
    }

    constructor(options: InteractionOptions) {
        this.element =
            typeof options.element === 'string'
                ? document.querySelector(options.element)
                : options.element;

        if (!this.element) {
            throw new Error('Element is not defined');
        }

        this.options = options;
        this.interactionType = options.interactionType;
        this.interactionSettings = options.interactionSettings;
        this.animationType = options.animationType;
        this.animationModule = animationModules[this.animationType];
        this.defaultStepSettings = options.defaultStepSettings;

        this.stepsInited = false;

        // For test only
        window.interactivity = this;

        this.init();
    }

    async init() {
        this.steps = this.options.steps.map((step): Step => {
            const { animationParams, ...currentStep } = step;
                
            // @ts-ignore
            const { normalizedAnimationParams, animation } = this.animationModule.create(this.element, {
                ...this.defaultStepSettings,
                ...animationParams,
            });
        
            return {
                transition: {
                    trigger: 'complete'
                },

                ...currentStep,

                animation,
                animationParams: normalizedAnimationParams,
 
                inPlay: false, 
                isCompleted: false,
                isActive: false
            };
        });

        await Promise.all(this.steps.map(step => new Promise(async(resolve, reject) => {
            try {
                await step.animation.init();

                resolve(true)
            }
            catch(err) {
                reject(err);
            }
        })));

        this.stepsInited = true;

        this.setActiveStep(0);

        if (this.interactionType === 'click') {
            this.startOnClick();
        }
        else if (this.interactionType === 'hover') {
            this.startOnHover();
        }
    }

    setActiveStep(stepIndex: number) {
        if (inRange(0, stepIndex, this.steps.length - 1)) {
            if (this.activeStep) {
                this.activeStep.inPlay = false;
                this.activeStep.isCompleted = true;
                this.activeStep.isActive = false;
            }

            this.activeStepIndex = stepIndex;
            this.activeStep = this.steps[stepIndex];

            this.activeStep.isActive = true;
        }
        else {
            throw new Error(`Step with index ${ stepIndex } not found`);
        }
    }

    startOnClick() {
        this.chainedInteractionHandler('click');
    }

    async startOnHover(skipBeforeStart = false) {
        const { hoverOutAction } = this.interactionSettings;

        this.chainedInteractionHandler('pointerenter', skipBeforeStart);
        
        await this.waitEvent('pointerleave');

        if (hoverOutAction === 'pause') {
            this.activeStep.animation.stop();

            this.startOnHover(true);
        }
        else if (hoverOutAction === 'reverse') {
            this.activeStep.animation.stop();

            this.reversePlaySteps();

            this.startOnHover(true);
        }
    }

    goToStep(stepIndex: number) {
        this.activeStep.animation.stop();
        
        this.setActiveStep(stepIndex);

        this.chainedInteractionHandler();
    }

    async chainedInteractionHandler(startEvent?: string, skipBeforeStart = false) {
        // @ts-ignore TODO pashtet
        const { animation, transition, isActive } = this.activeStep;
        const { trigger, triggerElement, eventType, jumpToStep } = transition;
        const nextStepIndex = jumpToStep ?? this.activeStepIndex + 1;

        if (!skipBeforeStart) {
            await animation.beforeStart();
        }

        if (startEvent) {
            await this.waitEvent(startEvent);
        }

        if (trigger === 'event') {
            this.waitEvent(eventType, triggerElement).then(() => this.goToStep(nextStepIndex));
        }

        animation.play().then(() => {
            if (trigger === 'complete' && isActive) {
                this.goToStep(nextStepIndex);
            }
        });
    }

    reversePlaySteps() {
        this.activeStep.animation.reversePlay().then(() => {
            const nextStepIndex = this.activeStepIndex - 1;

            if (nextStepIndex >= 0) {
                this.setActiveStep(nextStepIndex);

                this.reversePlaySteps();
            }
        });
    }

    async waitEvent(eventType: string, element: HTMLElement = this.element) {
        return new Promise((resolve) => {
            element.addEventListener(eventType, (e) => resolve(e));
        });
    }
}
