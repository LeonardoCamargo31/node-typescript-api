import { AxiosStatic } from 'axios';

// interface para descrever objetos/shape de dados

// chave fica dinâmica
// "noaa": 64.26
export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

// shape da resposta completa
export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class StormGlass {
  readonly stormGlassAPISource = 'noaa';
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  // vou receber o axios, já cria o this.request
  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    // get<T = any, R = AxiosResponse<T>>
    // passo um tipo, e ele responde uma promise com o teu tipo
    // basta passar nosso tipo
    const response = await this.request.get<StormGlassForecastResponse>(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`
    );
    return this.normalizeResponse((await response).data);
  }

  // normalizar nossa resposta
  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    // garantir cada um desses objetos tenha todas as chaves
    // o filter vai chamar o isValidPoint passando o point por parâmetro
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      // swellDirection: swellDirection.noaa
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  // todas as chaves podem ser nulas
  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      // se tem: "noaa": 64.26
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
