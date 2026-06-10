/**
 * It returns the data from the given url
 * @param url - The URL to make the request to.
 * @returns a promise.
 */
import axios from "axios";
export async function getData(url) {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not fetched !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
  }
}

export async function postData(url, data) {
  try {
    return await axios.post(url, data);
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not posted !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
  }
}

export async function putData(url, data) {
  try {
    return await axios.put(url, data);
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not updated !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
  }
}

export async function deleteData(url) {
  try {
    return await axios.delete(url);
  } catch (error) {
    console.error("Error", error);
    alert(`${"data is not deleted !! check console.............!!                     imp Note: plz run application on http://localhost:3000/"}`);
  }
}
