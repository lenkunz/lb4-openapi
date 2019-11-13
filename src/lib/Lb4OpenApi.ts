import { Binding, MetadataAccessor, MetadataInspector, MetadataMap, DecoratorFactory, Reflector } from "@loopback/core";
import { RestEndpoint, ParameterObject } from "@loopback/rest";

export namespace Lb4OpenApi {
    const METHODS_KEY = MetadataAccessor.create<Partial<RestEndpoint>, MethodDecorator>('openapi-v3:methods');
    const PARAMETERS_KEY = MetadataAccessor.create<ParameterObject, ParameterDecorator>('openapi-v3:parameters');

    export function getConstructor(
        binding: Readonly<Binding<any>>
    ): Function {
        return binding.valueConstructor as Function;
    }

    export function getControllerName(
        binding: Readonly<Binding<any>>
    ): string {
        return binding.key
            .replace(/^controllers\./, '')
            .replace(/Controller$/, '');
    }

    export function getMethodSpec(
        ctor: Function
    ): MetadataMap<RestEndpoint> {
        const spec = MetadataInspector.getAllMethodMetadata<RestEndpoint>(
            METHODS_KEY,
            ctor.prototype,
        ) || {};

        return cloneDeep(spec);
    }

    export function updateMethodSpec(
        ctor: Function,
        newSpec: MetadataMap<RestEndpoint>
    ) {
        MetadataInspector.defineMetadata(
            METHODS_KEY,
            newSpec,
            ctor.prototype,
        );    
    }

    export function cloneDeep<V>(
        val: Readonly<V>
    ): V {
        return DecoratorFactory.cloneDeep<V>(val);
    }

    export interface MethodParameterSpec {
        [index:string]: ParameterObject[];        
    }

    export function getParameterSpec(
        ctor: Function
    ): MetadataMap<ParameterObject[]>{

        const spec = Reflector.getMetadata(
            PARAMETERS_KEY.toString(),
            ctor.prototype,
        ) as MetadataMap<ParameterObject[]>;
        
        return cloneDeep(spec);
    }

    export function updateParameterSpec(
        ctor: Function,
        newSpec: MetadataMap<ParameterObject[]>
    ) {
        Reflector.defineMetadata(
            PARAMETERS_KEY.toString(),
            newSpec,
            ctor.prototype,
        )    
    }

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

    export function IsSpecModified(spec: any, modificationName: string): boolean {
        let modifications = _getModifications(spec);

        if (modifications.indexOf(modificationName) === -1) {
            return false;
        }

        return true;
    }

    export function SetSpecModified(
        spec: any, 
        modificationName: string
    ): void {
        let modifications = _getModifications(spec);        

        modifications.push(modificationName);

        spec['x-souta-modifications'] = modifications;    
    }
}