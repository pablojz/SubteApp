import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forecast-gtfs',
  templateUrl: './forecast-gtfs.component.html'
})
export class ForecastGTFSComponent {
  public entities: Entity[];
  public resultado: string;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<Entity[]>(baseUrl + 'ForecastGTFS').subscribe(result => {
      this.entities = result;
      console.log(result);
    }, error => console.error(error));
  }
}



export interface ForecastGTFS {
  Header: Header;
  Entity: Entity[];
}

export interface Entity {
  ID: string;
  Linea: Linea;
}

export interface Linea {
  Trip_Id: string;
  Route_Id: string;
  Direction_ID: number;
  start_time: string;
  start_date: string;
  Estaciones: Estacione[];
}

export interface Estacione {
  stop_id: string;
  stop_name: string;
  arrival: Arrival;
  departure: Arrival;
}

export interface Arrival {
  time: number;
  delay: number;
}

export interface Header {
  timestamp: number;
}
