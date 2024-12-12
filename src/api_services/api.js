import axios from 'axios'

const API_BASE_URL = "https://newsapi.org/v2/top-headlines?"
const API_COUNTRY_OPTION = "country=us"

const API_KEY = import.meta.env.VITE_NEWS_API;
const API_KEY_STR = `&apiKey=${API_KEY}`;

const getNewsData = async (setNewsDataHook, setCurCategory, categoryPath = '')=>{

    const categoryOption = categoryPath ? `&category=${categoryPath}` : "";

    try{
        const response = await axios.get(`${API_BASE_URL}${API_COUNTRY_OPTION}${categoryOption}${API_KEY_STR}`);
        setNewsDataHook(response.data.articles);
        setCurCategory(categoryPath);
        return response.data.articles;
    }
    catch(error)
    {
        console.log(`Get Data Error : ${error}`);
    }
}

export {getNewsData}
