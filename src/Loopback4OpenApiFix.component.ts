import { bind, ContextTags, inject, CoreBindings, Component } from '@loopback/core';
import { Loopback4OpenApiFixBindings } from './keys';
import { RestApplication } from '@loopback/rest';
import { Lb4OpenApiSpec } from './lib/Lb4OpenApiSpec';

@bind({tags: {[ContextTags.KEY]: Loopback4OpenApiFixBindings.COMPONENT}})
export class Loopback4OpenApiFixComponent implements Component {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        private application: RestApplication,        
    ) {
        Lb4OpenApiSpec.InterceptRestServerMetadata(application.restServer);
    }
}