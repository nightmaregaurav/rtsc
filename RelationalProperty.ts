import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";

export default class RelationalProperty<T extends PlainObject> {
  name: string;
  class: ClassReference<T>;
  idProperty: string;
  isList: boolean;
}