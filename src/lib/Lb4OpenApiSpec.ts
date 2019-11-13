import { OpenApiSpec, PathItemObject, OperationObject, ParameterObject, ReferenceObject, RestServer, RequestContext, RestEndpoint, Trie } from "@loopback/rest";
import { MetadataInspector, DecoratorFactory, MetadataAccessor, Reflector, Binding } from "@loopback/core";

export namespace Lb4OpenApiSpec {
    export function InterceptRestServerMetadata(rest: RestServer) {
        const start = rest.start.bind(rest);

        rest.start = async () => {
            await _modifyControllerSpec(rest);
            return await start();
        };
    }

    async function _modifyControllerSpec(rest: RestServer) {
        for(let binding of rest.find('controllers.*')) {
            await _changeControllerName(binding);
            await _modifyParameterSpec(binding);
        }
    }

    const METHODS_KEY = MetadataAccessor.create<
                            Partial<RestEndpoint>,
                            MethodDecorator
                        >('openapi-v3:methods');

    function _getModifications(spec: any): string[]{
        if (!spec) {
            return [];
        }

        let modifications = spec['x-souta-modifications'] as string[] || [];

        if (!Array.isArray(modifications)) {
            return [];
        }

        return modifications;
    }

    function _setModified(
        spec: any, 
        modificationName: string
    ): void {
        let modifications = _getModifications(spec);        

        modifications.push(modificationName);

        spec['x-souta-modifications'] = modifications;    
    }

    function _isModified(spec: any, modificationName: string): boolean {
        let modifications = _getModifications(spec);

        if (modifications.indexOf(modificationName) === -1) {
            return false;
        }

        return true;
    }
    
    async function _changeControllerName(binding: Readonly<Binding<any>>) {
        const controllerName = binding.key
                                .replace(/^controllers\./, '')
                                .replace(/Controller$/, '');

        const ctor = binding.valueConstructor as Function;
    
        if (!ctor) {
            return;
        }                            
    
        let endpoints = MetadataInspector.getAllMethodMetadata<RestEndpoint>(
            METHODS_KEY,
            ctor.prototype,
        ) || {};
    
        endpoints = DecoratorFactory.cloneDeep(endpoints);
    
        for (const operation in endpoints) {
            const endpoint = endpoints[operation];
    
            const spec = (endpoint.spec || {}) as OperationObject;

            if (_isModified(spec, 'controller-name')) {
                continue;
            }
            _setModified(spec, 'controller-name');
        
            if(!spec['x-controller-name']) {
                spec['x-controller-name'] = controllerName;
            }
    
            if(!spec['operationId']) {
                spec['operationId'] = `${controllerName}_${operation}`;
            }
            
            endpoint.spec = spec;
        }      
    
        MetadataInspector.defineMetadata(
            METHODS_KEY,
            endpoints,
            ctor.prototype,
        );        
    }

    const PARAMETERS_KEY = MetadataAccessor.create<
                                ParameterObject,
                                ParameterDecorator
                            >('openapi-v3:parameters');

    async function _modifyParameterSpec(binding: Readonly<Binding<any>>) {
        let ctor = binding.valueConstructor as Function;
        
        let ctorParams = Reflector.getMetadata(
                                PARAMETERS_KEY.toString(),
                                ctor.prototype,
                            ) as { [index:string]: ParameterObject[] };
    
        for (const operation in ctorParams) {
            const params = ctorParams[operation];
    
            for(const param in params) {
                if (params[param]) {
                    _findAndReplaceExample(params[param]);
                }
            }
        }
    
        Reflector.defineMetadata(
            PARAMETERS_KEY.toString(),
            ctorParams,
            ctor.prototype,
        )    
    }

    function _findAndReplaceExample(prop: any) {
        if(typeof prop !== 'object') {
            return;
        }

        const keys = Object.keys(prop);

        keys.forEach(key => {
            if (key === 'examples' && Array.isArray(prop[key])) {
                prop.example = prop[key][0];
                delete prop[key];
            } else {
                _findAndReplaceExample(prop[key]);
            }
        })
    }
}