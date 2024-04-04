import {ClassReference} from "@nightmaregaurav/ts-utility-types";

export class RelationalProperty {
    name: string;
    relatedClass: ClassReference<any>;
    idPropName: string;
    isList: boolean;
}

export class RelationalClassSpecification {
    registeredClass: ClassReference<any>;
    tableName: string;
    identifier: string;
    relationalProperties: RelationalProperty[];
}
