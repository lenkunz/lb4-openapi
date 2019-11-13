import { ClassDecoratorFactory } from "@loopback/core"
import { Lb4OpenApiPrivateKeys } from "../keys"

export interface PartOfMetadata {
    name: string;
}

export function partOf(target: Function) {
    return ClassDecoratorFactory.createDecorator(
        Lb4OpenApiPrivateKeys.CONTROLLER_NAME,
        {
            name: target.name,
        },
        {decoratorName: "@partOf"}
    );
}