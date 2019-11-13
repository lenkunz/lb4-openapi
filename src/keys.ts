import { Lb4OpenApiFixConfig, Lb4OpenApiFixComponent } from "./Lb4OpenApiFix.component";
import { BindingKey, MetadataAccessor } from "@loopback/core";
import { Lb4OpenApiComponent } from "./Lb4OpenApi.component";
import { PartOfMetadata } from "./decorator";

export namespace Lb4OpenApiPrivateKeys {
    export const COMPONENT_FIX = BindingKey.create<Lb4OpenApiFixComponent>(
        'components.Lb4OpenApiFixComponent',
    );    

    export const COMPONENT = BindingKey.create<Lb4OpenApiComponent>(
        'components.Lb4OpenApiComponent',
    );    
    
    export const CONTROLLER_NAME = MetadataAccessor.create<
        PartOfMetadata,
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