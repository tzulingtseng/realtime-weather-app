import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = (locationName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-8EB766D5-C125-40D8-9DD6-04F5E9ECAAF3&locationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      // cosole.log("data", data);
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          // console.log("neededElement", neededElements);
          // console.log("item", item);

          if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        }
      );
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD
      };
    });
};

const fetchWeatherForecast = (cityName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-8EB766D5-C125-40D8-9DD6-04F5E9ECAAF3&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log("data", data);
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    });
};

const useWeatherApi = (currentLocation) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true
  });
  const { locationName, cityName } = currentLocation;
  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      // console.log("click");

      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName)
      ]);
      // console.log("data", data);
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false
      });
    };
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true
    }));
    fetchingData();
  }, [locationName, cityName]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return [weatherElement, fetchData];
};

export default useWeatherApi;
