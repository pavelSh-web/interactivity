type BaseInteractionStep = {
    animation: StepAnimation[];
};

type IntersectionLine = 'top' | 'center' | 'bottom';
type DistanceValue = string; // '10%' or '20px'
type SeekCursorDirection = 'x' | 'y';

// TODO pashtet: в зависимости от trigger менять опции
type StepTransition = {
    trigger: 'complete' | 'event',
    eventType?: string,
    triggerElement?: HTMLElement,
    jumpToStep?: number;
};

type ScrollStep = {
    distance: string; // '10%' or '20px'
    mode: 'seek' | 'play' | 'stop';
};

type CursorStep = {
    actionRange: string[]; // ['10%', '40%']
    mode: 'seek' | 'play' | 'stop';
};

type HoverStep = {
    transition?: StepTransition;
    mode: 'play' | 'stop';
};
type ClickStep = {
    transition?: StepTransition;
    mode: 'play' | 'stop';
};
type ScreenStep = {
    transition?: StepTransition;
    mode: 'play' | 'stop';
};

type ScrollInteractionSetting = {
    reversePlay: boolean;
    intersectionLine: IntersectionLine;
    intersectionLineOffset: DistanceValue;
};

type CursorInteractionSetting = {
    seekDirection: SeekCursorDirection;
};

type ScreenInteractionSetting = {
    loopSteps: boolean;
    intersectionLine: IntersectionLine;
    intersectionLineOffset: DistanceValue;
};

type HoverInteractionSetting = {
    hoverOutAction: 'pause' | 'reverse' | 'none';
};

type ClickInteractionSetting = {};

type InteractionStepsConfig = {
    scroll: ScrollStep;
    screen: ScreenStep;
    hover: HoverStep;
    cursor: CursorStep;
    click: ClickStep;
};

type InteractionSettingsConfig = {
    scroll: ScrollInteractionSetting;
    screen: ScreenInteractionSetting;
    hover: HoverInteractionSetting;
    cursor: CursorInteractionSetting;
    click: ClickInteractionSetting;
};

type ElementAnimationSettings = { test: 'cursor' };
type LottieAnimationSettings = {
    path: string;
};

type AnimationSettingsConfig = {
    lottie: LottieAnimationSettings;
    element: ElementAnimationSettings;
};

type LottieDirection = 'forward' | 'backward';
type LottiePlayMode = 'normal' | 'bounce';

export type ElementAnimationParams = {};
export type LottieAnimationParams = {
    path: string;
    speed?: number;
    count?: number;
    loop?: number | boolean;
    playMode?: LottiePlayMode;
    direction?: LottieDirection;
    frames?: number[];
};

export type AnimationParamsConfig = {
    element: ElementAnimationParams;
    lottie: LottieAnimationParams;
};

export type InteractionType = keyof InteractionStepsConfig;
export type AnimationType = keyof AnimationParamsConfig;

export type InteractionStep =
    InteractionStepsConfig[keyof InteractionStepsConfig] & {
        animationParams: AnimationParamsConfig[keyof AnimationParamsConfig];
    };

export type InteractionSettings =
    InteractionSettingsConfig[keyof InteractionSettingsConfig];

export type InteractionOptions = {
    [InteractionType in keyof InteractionStepsConfig]: {
        [AnimationType in keyof AnimationParamsConfig]: {
            animationType: AnimationType;
            defaultStepSettings?: AnimationParamsConfig[AnimationType];
            interactionType: InteractionType;
            interactionSettings: InteractionSettingsConfig[InteractionType];
            element: HTMLElement | string;
            steps: (InteractionStepsConfig[InteractionType] & {
                animationParams: AnimationParamsConfig[AnimationType];
            })[];
        };
    }[keyof AnimationParamsConfig];
}[keyof InteractionStepsConfig];
