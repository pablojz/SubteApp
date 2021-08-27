import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public entities: Entity[];
  public resultado: string;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<Entity[]>(baseUrl + 'ServiceAlert').subscribe(result => {
      this.entities = result;
      console.log(result);
    }, error => console.error(error));
  }
}

export interface ServiceAlerts {
  header: Header;
  entity: Entity[];
}

export interface Entity {
  id: string;
  is_deleted: boolean;
  trip_update: null;
  vehicle: null;
  alert: Alert;
}

export interface Alert {
  active_period: any[];
  informed_entity: InformedEntity[];
  cause: number;
  effect: number;
  url: null;
  header_text: Text;
  description_text: Text;
}

export interface Text {
  translation: Translation[];
}

export interface Translation {
  text: string;
  language: Language;
}

export enum Language {
  Es = "es",
}

export interface InformedEntity {
  agency_id: string;
  route_id: string;
  route_type: number;
  trip: null;
  stop_id: string;
}

export interface Header {
  gtfs_realtime_version: string;
  incrementality: number;
  timestamp: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toServiceAlerts(json: string): ServiceAlerts {
    return cast(JSON.parse(json), r("ServiceAlerts"));
  }

  public static serviceAlertsToJson(value: ServiceAlerts): string {
    return JSON.stringify(uncast(value, r("ServiceAlerts")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
  if (key) {
    throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) { }
    }
    return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue("array", val);
    return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue("Date", val);
    }
    return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue("object", val);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach(key => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, prop.key);
    });
    Object.getOwnPropertyNames(val).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  "ServiceAlerts": o([
    { json: "header", js: "header", typ: r("Header") },
    { json: "entity", js: "entity", typ: a(r("Entity")) },
  ], false),
  "Entity": o([
    { json: "id", js: "id", typ: "" },
    { json: "is_deleted", js: "is_deleted", typ: true },
    { json: "trip_update", js: "trip_update", typ: null },
    { json: "vehicle", js: "vehicle", typ: null },
    { json: "alert", js: "alert", typ: r("Alert") },
  ], false),
  "Alert": o([
    { json: "active_period", js: "active_period", typ: a("any") },
    { json: "informed_entity", js: "informed_entity", typ: a(r("InformedEntity")) },
    { json: "cause", js: "cause", typ: 0 },
    { json: "effect", js: "effect", typ: 0 },
    { json: "url", js: "url", typ: null },
    { json: "header_text", js: "header_text", typ: r("Text") },
    { json: "description_text", js: "description_text", typ: r("Text") },
  ], false),
  "Text": o([
    { json: "translation", js: "translation", typ: a(r("Translation")) },
  ], false),
  "Translation": o([
    { json: "text", js: "text", typ: "" },
    { json: "language", js: "language", typ: r("Language") },
  ], false),
  "InformedEntity": o([
    { json: "agency_id", js: "agency_id", typ: "" },
    { json: "route_id", js: "route_id", typ: "" },
    { json: "route_type", js: "route_type", typ: 0 },
    { json: "trip", js: "trip", typ: null },
    { json: "stop_id", js: "stop_id", typ: "" },
  ], false),
  "Header": o([
    { json: "gtfs_realtime_version", js: "gtfs_realtime_version", typ: "" },
    { json: "incrementality", js: "incrementality", typ: 0 },
    { json: "timestamp", js: "timestamp", typ: 0 },
  ], false),
  "Language": [
    "es",
  ],
};
