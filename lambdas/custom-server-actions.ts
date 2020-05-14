import { ICustomActions } from "./interfaces/custom-actions";
import { CustomEffect } from "./interfaces/custom-effect";

/**
 * Custom server card actions, used by AI.
 */
export class CustomServerActions implements ICustomActions {
    customEffects: Map<string, CustomEffect>;

    constructor() {
        this.customEffects = new Map<string, CustomEffect>();
    }

    /**
     * Get the custom effect by name.
     */
    get(key:string): CustomEffect {
        return this.customEffects.get(key) as CustomEffect;
    }

}