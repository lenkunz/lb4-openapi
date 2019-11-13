import { ClassDecoratorFactory } from "@loopback/core"
import { Lb4OpenApiPrivateKeys } from "../keys"

export function partOf(target: Function) {
    return ClassDecoratorFactory.createDecorator(
        Lb4OpenApiPrivateKeys.CONTROLLER_NAME,
        target.name,
        {decoratorName: "@partOf"}
    );
}