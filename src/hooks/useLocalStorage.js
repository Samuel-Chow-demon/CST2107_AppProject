
// localStorage.getItem(key)
// localStorage.setItem(key, value)

import { useEffect } from "react";
import { useState } from "react";

function useLocalStorage(key, initialValue) {

    const calculateDefaultvalue = () => {
       const storedValue =  localStorage.getItem(key);
       const parsedValue = storedValue ? JSON.parse(storedValue) : initialValue;
       return parsedValue;
    }

    const [value, setValue] = useState(calculateDefaultvalue);

    const updateValue = (newValue) => {
        //console.log("set Local storage", newValue)
        setValue(newValue)
    }

    useEffect(() => {
        (value) ? localStorage.setItem(key, JSON.stringify(value)) : localStorage.setItem(key, null);
    }, [key, value])

    return [value, updateValue]

}

export default useLocalStorage;