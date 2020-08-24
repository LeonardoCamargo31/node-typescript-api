import { AxiosStatic } from 'axios';
import { InternalError } from '@src/util/errors/internal-error';
import config, { IConfig } from 'config';

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

// erro interno, erro na requisição
export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

// erro da api externa
export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPISource = 'noaa';
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  // vou receber o axios, já cria o this.request
  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      // get<T = any, R = AxiosResponse<T>>
      // passo um tipo, e ele responde uma promise com o teu tipo
      // basta passar nosso tipo
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get(
          'apiUrl'
        )}/weather/point?lat=${lat}&lng=${lng}&params=${
          this.stormGlassAPIParams
        }&source=${this.stormGlassAPISource}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apiToken'),
            // Authorization: 'fake-token',
          },
        }
      );
      return this.normalizeResponse((await response).data);
    } catch (err) {
      // Isso é lidar com os erros do Axios especificamente
      if (err.response && err.response.status) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${
            err.response.status
          }`
        );
      }
      throw new ClientRequestError(err.message);
    }
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
  // Partial transforma todas as props da interface como opcional
  // força a validar todas elas
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
