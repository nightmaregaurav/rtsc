import {Class} from "./BaseTypes";

export class RelationalProperty {
    name: string;
    relatedClass: Class<any>;
    idPropName: string;
    isList: boolean;
}

export class RelationalClassSpecification {
    registeredClass: Class<any>;
    tableName: string;
    identifier: string;
    relationalProperties: RelationalProperty[];
}
