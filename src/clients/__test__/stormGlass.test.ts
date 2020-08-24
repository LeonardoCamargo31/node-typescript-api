import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';

// não preciso mais bater na api real, tenho uma resposta
import stormglassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  // dizer que essa instância ele é um tipo de mock
  // temos um mock não tipado, e precisamos criar isso
  // as forçando o typescript a inferir/conclusão/deduzir esse tipo
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  // vir um forecast normalizado do StormGlass
  // esse client faz um fetch dos dados e normalize
  // normalizar: da maneira que vem da API pra como espero na minha aplicação
  it('should return the normalized forecast from StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    // substituímos o get por esse valor
    mockedAxios.get = jest
      .fn()
      .mockResolvedValue({ data: stormglassWeatherPointFixture });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglassNormalizedResponseFixture);
  });

  // não tem dados deve ser excluído
  // como não passei obj completo, não cria um ForecastPoint
  it('should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };
    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  // deve obter um erro genérico do serviço StormGlass quando a solicitação falha antes de chegar ao serviço
  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedAxios);

    // usar o catch fica feito, então usamos o rejects
    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  // quando eles responderem um erro, exemplo esgotar o limite de chamadas
  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
