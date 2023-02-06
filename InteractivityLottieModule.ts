import { LottieAnimationParams, LottieDirection } from './typings.d';

const DEFAULT_OPTIONS = {
    player: 'lottie-player',
};
const LOTTIE_PLAYER_NODE = 'LOTTIE-PLAYER';
const ERROR_PREFIX = '[lottieInteractivity]:';

export default class InteractivityLottieModule {
    animationParams: LottieAnimationParams;
    player: any;
    playerElement: any;
    
    initialFrames: number[];
    frames: number[];
    direction: LottieDirection = 'forward';

    inReverseState: boolean = false;

    isStopped: boolean = true;
    completed: boolean = false;

    lastFrame: number = 0;

    fileName: string;

    private _completedIterations: number = 0;

    get totalFramesLength() {
        return Math.abs(this.frames[0] - this.frames[1]);
    }

    get currentFrame() {
        return this.player.firstFrame + this.player.currentFrame;
    }

    static loadedLotties: string[] = [];

    static create(element: HTMLElement, animationParams: LottieAnimationParams) {
        animationParams = {
            count: 1,
            loop: false,
            playMode: 'normal',
            direction: 'forward',

            ...animationParams
        };

        const lottieAnimation = new InteractivityLottieModule(element, animationParams);

        return {
            normalizedAnimationParams: animationParams,
            animation: lottieAnimation
        };
    }

    constructor(element: HTMLElement, animationParams: LottieAnimationParams) {
        this.animationParams = animationParams;
        this.player = null;
        this.playerElement = element;
    }

    async init() {
        const { path } = this.animationParams;

        let fileName = path.substr(path.lastIndexOf('/') + 1);
        fileName = fileName.substr(0, fileName.lastIndexOf('.json'));

        if (!InteractivityLottieModule.loadedLotties.includes(fileName)) {
            await fetch(path);

            InteractivityLottieModule.loadedLotties.push(fileName);
        }

        this.fileName = fileName;

        if (!this.playerElement._lottie || !this.playerElement._lottie.isLoaded) {
            await new Promise((resolve) =>
                this.playerElement.addEventListener('load', resolve)
            );
        }
    
        this.player = this.playerElement.getLottie();

        // Throw error no player instance has been successfully resolved
        if (!this.player) {
            let message =
                ERROR_PREFIX +
                'Specified player:' +
                this.player +
                ' is invalid.';

            throw new Error(message);
        }

        return true;
    }

    async beforeStart() {
        const { speed, direction, path, frames } = this.animationParams;

        // Ждем когда плейер загрузит анимацию
        await new Promise((resolve) => {
            this.playerElement.addEventListener('ready', () => resolve(true));

            // Отрабатывает практически моментально, так как мы заранее подгрузили все лотти файлы
            this.playerElement.load(path);
        });

        this.player = this.playerElement.getLottie();

        this.frames = frames ?? [0, this.player.totalFrames];

        this.player.setSpeed(speed);
        this.toggleDirection(direction);

        this.lastFrame = this.frames[0];

        this._completedIterations = 0;

        this.player.firstFrame = 0;

        this.player.goToAndStop(this.lastFrame, true);
    }

    async play() {
        if (this.inReverseState) {
            this.toggleDirection();
            
            this.inReverseState = false;
        }

        await this.playFrames();
    }

    async reversePlay() {
        if (!this.inReverseState) {
            this.toggleDirection()
            
            this.inReverseState = true;
        }

        this._completedIterations = 0;

        await this.playFrames(true);
    }

    async playFrames(one = false) {
        this.player.removeEventListener('complete');

        return new Promise((resolve) => {
            this.player.playSegments([this.lastFrame, this.frames[1]], true);

            this.player.addEventListener('complete', () => {
                const { count, loop, playMode } = this.animationParams;
                const isBounce = playMode === 'bounce';
    
                this._completedIterations += isBounce ? 0.5 : 1;

                console.log(this._completedIterations);
    
                if ((!loop || one) && (this._completedIterations >= count)) {
                    resolve(true);

                    this._completedIterations = 0;

                    this.setComplete();
    
                    return;
                }

                if (isBounce) {
                    this.toggleDirection();
                }
    
    
                this.player.playSegments(this.frames, true);
            });
    
            this.isStopped = false;
        });
    }

    goToAndStop() {}

    stop(reset = true) {
        this.player.removeEventListener('complete');
        this.player.pause();

        this.lastFrame = this.currentFrame;
        this.isStopped = true;
    }

    seek({ iteration, iterationPercent, totalIterations }) {
        const { playMode } = this.animationParams;

        let frameShift = (this.totalFramesLength * iterationPercent) / 100;

        if (playMode === 'bounce' && !(iteration % 2)) {
            frameShift = this.totalFramesLength - frameShift;
        }

        let currentFrame = Math.min(...this.frames) + frameShift;

        if (this.direction === 'backward') {
            currentFrame = Math.max(...this.frames) - frameShift;
        }

        if (this.player.currentFrame !== currentFrame) {
            this.player.goToAndStop(currentFrame, true);
        }

        if (iteration === totalIterations && iterationPercent > 99) {
            this.setComplete();
        }

        this.isStopped = false;
    }

    toggleDirection(direction?: LottieDirection) {
        const newDirection = direction
            ? direction
            : this.direction === 'forward'
            ? 'backward'
            : 'forward';

        if (this.direction !== newDirection) {
            this.frames.reverse();
        }
        this.direction = newDirection;
    }

    setComplete() {
        const { frames } = this.animationParams;        

        this.lastFrame = frames ? frames[0] : 0;

        this.completed = true;

        this.onComplete();
    }

    onComplete() {}
}
