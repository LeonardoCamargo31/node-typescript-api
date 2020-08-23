import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';

// não preciso mais bater na api real, tenho uma resposta
import stormglassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as stormglassWeatherPointFixture from '@test/fixtures/stormglass_weather_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  // vir um forecast normalizado do StormGlass
  // esse client faz um fetch dos dados e normalize
  // normalizar: da maneira que vem da API pra como espero na minha aplicação
  it('should return the normalized forecast from StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    // substituímos o get por esse valor
    axios.get = jest
      .fn()
      .mockResolvedValue({ data: stormglassWeatherPointFixture });

    const stormGlass = new StormGlass(axios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglassNormalizedResponseFixture);
  });
});
