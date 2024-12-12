import {createContext, useContext, useEffect, useState} from 'react'
import { getNewsData } from '../api_services/api';

const newsDataContext = createContext(null);

const useNewsData = ()=>useContext(newsDataContext);

const NewsDataProvider = ({children})=>{

    const [newsData, setNewsData] = useState([])
    const [curCategory, setCurCategory] = useState('')
    const [isLoading, setIsLoading] = useState(true);

    return (
        <newsDataContext.Provider value={{
            newsData, setNewsData,
            curCategory, setCurCategory, isLoading, setIsLoading
        }}>
            {children}
        </newsDataContext.Provider>
    );
}

export {useNewsData, NewsDataProvider};