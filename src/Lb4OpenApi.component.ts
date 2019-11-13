import { bind, ContextTags, inject, CoreBindings, Component, Binding, Reflector } from '@loopback/core';
import { Lb4OpenApiPrivateKeys, Lb4OpenApiKeys } from './keys';
import { RestApplication, OperationObject } from '@loopback/rest';
import { Lb4OpenApi } from './lib';

export interface Lb4OpenApiConfig {
}

const defaultConfig: Lb4OpenApiConfig = {
}

@bind({tags: {[ContextTags.KEY]: Lb4OpenApiPrivateKeys.COMPONENT}})
export class Loopback4OpenApiComponent implements Component {
    private config: Lb4OpenApiConfig;

    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        private application: RestApplication,
        @inject(Lb4OpenApiKeys.Lb4Config, {
            optional: true,
        })
        config: Partial<Lb4OpenApiConfig> = {},
    ) {
        this.config = {
            ...defaultConfig,
            ...config,
        };

        this._interceptRestServerMetadata();
    }

    private _interceptRestServerMetadata() {
        const rest = this.application.restServer;
        const start = rest.start.bind(this);

        rest.start = async () => {
            await this._modifyControllerSpec();
            return await start();
        };
    }

    async _modifyControllerSpec() {
        const rest = this.application.restServer;

        for(let binding of rest.find('controllers.*')) {
            this._applyNameChange(binding);
        }
    }

    async _applyNameChange(binding: Readonly<Binding<any>>) {
        const ctor = Lb4OpenApi.getConstructor(binding);

        const targetName = Reflector.getMetadata(
            Lb4OpenApiPrivateKeys.CONTROLLER_NAME.toString(),
            ctor.prototype
        ) as String;

        if (!targetName) {
            return;
        }

        let endpoints = Lb4OpenApi.getMethodSpec(ctor);

        for (const operation in endpoints) {
            const endpoint = endpoints[operation];
    
            const spec = (endpoint.spec || {}) as OperationObject;

            if (Lb4OpenApi.IsSpecModified(spec, 'controller-name')) {
                continue;
            }
            Lb4OpenApi.SetSpecModified(spec, 'controller-name');
        
            if(!spec['x-controller-name']) {
                spec['x-controller-name'] = targetName;
            }

            endpoint.spec = spec;
        }
    
        Lb4OpenApi.updateMethodSpec(ctor, endpoints);   
    }
}