import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import WeatherCard from "./WeatherCard";
import WeatherSetting from "./WeatherSetting";
import { useTheme, ThemeProvider, withTheme } from "@emotion/react";
import sunriseAndSunsetData from "./sunrise-sunset.json";
// STEP 1：載入 useWeatherApi Hook
import useWeatherApi from "./useWeatherApi";
import { findLocation } from "./utils";

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282"
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc"
  }
};

const Container = styled.div`
  /* background-color: #ededed; */
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getMoment = (locationName) => {
  // const locationName = "臺北";

  // 從日出日落時間中找出符合的地區
  const location = sunriseAndSunsetData.find(
    (data) => data.locationName === locationName
  );
  // console.log("location", location);

  // 找不到的話則回傳 null
  if (!location) return null;
  // 取得當前時間
  const now = new Date();
  // 將當前時間以 "2019-10-08" 的時間格式呈現
  // const nowDate = Intl.DateTimeFormat("zh-TW", {
  //   year: "numeric",
  //   month: "2-digit",
  //   day: "2-digit"
  // })
  //   .format(now)
  //   .replace(/\//g, "-");
  const nowDate = "2020-12-31";
  // console.log(nowDate);
  // STEP 6：從該地區中找到對應的日期
  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);
  // console.log("locationDate", locationDate);

  // STEP 7：將日出日落以及當前時間轉成時間戳記（TimeStamp）
  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`
  ).getTime();
  // console.log("sunriseTimestamp",`${locationDate.dataTime} ${locationDate.sunrise}`);

  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`
  ).getTime();
  const nowTimeStamp = now.getTime();
  // console.log("nowTimeStamp", nowTimeStamp);

  // STEP 8：若當前時間介於日出和日落中間，則表示為白天，否則為晚上
  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? "day"
    : "night";
};
// console.log("getMoment", getMoment("臺北"));

const WeatherApp = () => {
  const storageCity = localStorage.getItem("cityName");
  const [currentCity, setCurrentCity] = useState(storageCity || "臺北市");
  const currentLocation = findLocation(currentCity) || {};

  const [weatherElement, fetchData] = useWeatherApi(currentLocation);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [currentPage, setCurrentPage] = useState("WeatherCard");
  // const { locationName } = weatherElement;
  const moment = useMemo(() => getMoment(currentLocation.sunriseCityName), [
    currentLocation.sunriseCityName
  ]);

  // 根據 moment 決定要使用亮色或暗色主題
  useEffect(() => {
    // console.log("moment", moment);
    setCurrentTheme(moment === "day" ? "light" : "dark");
    // 記得把 moment 放入 dependencies 中
  }, [moment]);

  useEffect(() => {
    localStorage.setItem("cityName", currentCity);
    // STEP 3-2：dependencies 中放入 currentCity
  }, [currentCity]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            cityName={currentLocation.cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            cityName={currentLocation.cityName}
            setCurrentCity={setCurrentCity}
            setCurrentPage={setCurrentPage}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};
export default WeatherApp;
