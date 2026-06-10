/**
 * It returns the data from the given url
 * @param url - The URL to make the request to.
 * @returns a promise.
 */
import axios from "axios";

function getAuthConfig(config = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || localStorage.getItem("token") || (() => {
      try { return JSON.parse(localStorage.getItem("user") || "{}")?.token; } catch { return null; }
    })();
  }
  
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    };
  }
  return config;
}

export async function getData(url, config = {}) {
  try {
    return await axios.get(url, getAuthConfig(config));
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not fetched !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
    throw error;
  }
}

export async function postData(url, data, config = {}) {
  try {
    return await axios.post(url, data, getAuthConfig(config));
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not posted !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
    throw error;
  }
}

export async function putData(url, data, config = {}) {
  try {
    return await axios.put(url, data, getAuthConfig(config));
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not updated !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
    throw error;
  }
}

export async function deleteData(url, config = {}) {
  try {
    return await axios.delete(url, getAuthConfig(config));
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not deleted !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
    throw error;
  }
}
