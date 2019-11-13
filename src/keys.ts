import { Loopback4OpenApiFixComponent, Lb4OpenApiFixConfig } from "./Lb4OpenApiFix.component";
import { BindingKey, MetadataAccessor, ClassDecoratorFactory } from "@loopback/core";

export namespace Lb4OpenApiPrivateKeys {
    export const COMPONENT_FIX = BindingKey.create<Loopback4OpenApiFixComponent>(
        'components.Lb4OpenApiFixComponent',
    );    

    export const COMPONENT = BindingKey.create<Loopback4OpenApiFixComponent>(
        'components.Lb4OpenApiFixComponent',
    );    
    
    export const CONTROLLER_NAME = MetadataAccessor.create<
        String,
        ClassDecorator
    >('souta:lb4OpenApi:controllerName');
}

export namespace Lb4OpenApiKeys {
    export const Lb4FixConfig = BindingKey.create<Lb4OpenApiFixConfig>(
        'components.Lb4OpenApiFixComponent.config',
    );

    export const Lb4Config = BindingKey.create<Lb4OpenApiFixConfig>(
        'components.Lb4OpenApiComponent.config',
    );
}