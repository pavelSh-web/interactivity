type LottieAnimationParams = { type: 'cursor' };
type ElementAnimationParams = { type: 'cursor' };

type AnimationParamsConfig = {
    lottie: LottieAnimationParams;
    element: ElementAnimationParams;
};

type StepAnimation = {
    [K in keyof AnimationParamsConfig]: {
        type: K;
        params: AnimationParamsConfig[K];
    };
}[keyof AnimationParamsConfig];

type BaseInteractionStep = {
    animations: StepAnimation[];
};

type ScrollStep = {
    distance: string;
};

type CursorStep = {};

type HoverStep = {};

type ClickStep = {};

type ScreenStep = {};

type InteractionOptionsConfig = {
    scroll: ScrollStep;
    screen: ScreenStep;
    hover: HoverStep;
    cursor: CursorStep;
    click: ClickStep;
};



type InteractionOptions = {
    [K in keyof InteractionOptionsConfig]: {
        type: K;
        // element: HTMLElement;
        steps: InteractionOptionsConfig[K] & BaseInteractionStep;
    };
}[keyof InteractionOptionsConfig];


