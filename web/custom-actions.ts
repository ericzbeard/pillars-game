import { decommision } from './actions/decommision';
import { predictiveAutoscaling } from './actions/predictive-autoscaling';
import { competitiveResearch } from './actions/competitive-research';
import { amazonKinesis } from './actions/amazon-kinesis';
import { ddosAttack } from './actions/ddos-attack';
import { talentShortage } from './actions/talent-shortage';
import { dataCenterMigration } from './actions/data-center-migration';
import { employeesPoached } from './actions/employees-poached';
import { ICustomActions } from '../lambdas/interfaces/custom-actions';
import { CustomEffect } from '../lambdas/interfaces/custom-effect';

export class CustomActions implements ICustomActions {

    customEffects: Map<string, CustomEffect>;

    /**
     * The callback is called when we are done with any custom actions.
     */
    constructor() {

        this.customEffects = new Map<string, CustomEffect>();

        this.customEffects.set("Decommision", decommision);
        this.customEffects.set("Predictive Autoscaling", predictiveAutoscaling);
        this.customEffects.set("Competitive Research", competitiveResearch);
        this.customEffects.set("Amazon Kinesis", amazonKinesis);
        this.customEffects.set("DDoS Attack", ddosAttack);
        this.customEffects.set("Talent Shortage", talentShortage);
        this.customEffects.set("Data Center Migration", dataCenterMigration);
        this.customEffects.set('Employees Poached', employeesPoached);

    }

    /**
     * Get the custom effect by name.
     */
    get(key:string): CustomEffect {
        return this.customEffects.get(key) as CustomEffect;
    }


}