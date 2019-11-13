import { bind, ContextTags, inject, CoreBindings, Component, Binding } from '@loopback/core';
import { Lb4OpenApiPrivateKeys, Lb4OpenApiKeys } from './keys';
import { RestApplication, OperationObject } from '@loopback/rest';
import { Lb4OpenApi } from './lib';

export interface Lb4OpenApiFixConfig {
    useControllerRenamer: boolean;
    modifyParameter: boolean;
}

const defaultConfig: Lb4OpenApiFixConfig = {
    useControllerRenamer: true,
    modifyParameter: true,
}

@bind({tags: {[ContextTags.KEY]: Lb4OpenApiPrivateKeys.COMPONENT_FIX}})
export class Lb4OpenApiFixComponent implements Component {
    private config: Lb4OpenApiFixConfig;

    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        private application: RestApplication,
        @inject(Lb4OpenApiKeys.Lb4FixConfig, {
            optional: true,
        })
        config: Partial<Lb4OpenApiFixConfig> = {},
    ) {
        this.config = {
            ...defaultConfig,
            ...config,
        };

        this._interceptRestServerMetadata();
    }

    private _interceptRestServerMetadata() {
        const rest = this.application.restServer;
        const start = rest.start.bind(rest);

        rest.start = async () => {
            await this._modifyControllerSpec();
            return await start();
        };
    }

    async _modifyControllerSpec() {
        const rest = this.application.restServer;

        const {
            modifyParameter,
            useControllerRenamer
        } = this.config;

        for(let binding of rest.find('controllers.*')) {
            if (modifyParameter) {
                await this._changeControllerName(binding);
            }

            if (useControllerRenamer) {
                await this._modifyParameterSpec(binding);
            }
        }
    }

    private async _changeControllerName(binding: Readonly<Binding<any>>) {
        const controllerName = Lb4OpenApi.getControllerName(binding);
        const ctor = Lb4OpenApi.getConstructor(binding);
    
        if (!ctor) {
            return;
        }                            
    
        let endpoints = Lb4OpenApi.getMethodSpec(ctor);
    
        for (const operation in endpoints) {
            let localControllerName = controllerName;

            const endpoint = endpoints[operation];
    
            const spec = (endpoint.spec || {}) as OperationObject;

            if (Lb4OpenApi.IsSpecModified(spec, 'controller-name-strip')) {
                continue;
            }
            Lb4OpenApi.SetSpecModified(spec, 'controller-name-strip');

            if (spec['x-controller-name']) {
                localControllerName = spec['x-controller-name']
                                        .replace(/^controllers\./, '')
                                        .replace(/Controller$/, '');
            }

            let operationName = operation;
            if (spec['x-operation-name']) {
                operationName = spec['x-operation-name'];
            }
        
            spec['x-controller-name'] = localControllerName;
            spec['operationId'] = `${localControllerName}_${operationName}`;
            
            endpoint.spec = spec;
        }      
    
        Lb4OpenApi.updateMethodSpec(ctor, endpoints);        
    }

    private async _modifyParameterSpec(binding: Readonly<Binding<any>>) {
        let ctor = Lb4OpenApi.getConstructor(binding);
        
        if (!ctor) {
            return;
        }                            

        let methodsParam = Lb4OpenApi.getParameterSpec(ctor);
    
        for (const operation in methodsParam) {
            const params = methodsParam[operation];
    
            for(const param in params) {
                if (params[param]) {
                    this._findAndReplaceExample(params[param]);
                }
            }
        }
    
        Lb4OpenApi.updateParameterSpec(ctor, methodsParam);
    }

    _findAndReplaceExample(prop: any) {
        if(typeof prop !== 'object') {
            return;
        }

        const keys = Object.keys(prop);

        keys.forEach(key => {
            if (key === 'examples' && Array.isArray(prop[key])) {
                prop.example = prop[key][0];
                delete prop[key];
            } else {
                this._findAndReplaceExample(prop[key]);
            }
        })
    }
}