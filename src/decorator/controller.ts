import { ClassDecoratorFactory } from "@loopback/core"
import { Lb4OpenApiPrivateKeys } from "../keys"

export interface PartOfMetadata {
    name: string;
    operationSuffix: string;
    noDuplicateSuffix: boolean;
}

export interface PartOfOption {
    for: Function;
}

export function partOf(target: Function, options?: Partial<PartOfOption>) {
    let forController = '';

    if (options && options.for) {
        forController = options.for.name;
    }

    const meta = {
        name: target.name,
        operationSuffix: forController,
        noDuplicateSuffix: true,
    };

    return ClassDecoratorFactory.createDecorator(
        Lb4OpenApiPrivateKeys.CONTROLLER_NAME,
        meta,
        {decoratorName: "@partOf"}
    );
}