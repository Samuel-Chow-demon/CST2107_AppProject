import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const authContext = createContext();

// Create Custom Hooks to return useContext(authContext)
const useAuth = () => useContext(authContext);

// Since every time the COmponent is to be rerender, the auth object in getAuth would be
// refresh also, thus you need to use a useState and provide to wait before
// the updated auth object is valid to check the firebase stored state
const AuthProvider = ({children})=>{

    const [firebaseUser, setFirebaseUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth();

    useEffect(()=>{
        const _stateHandle = onAuthStateChanged(auth, (userCurrent)=>{
            setFirebaseUser(userCurrent);
            setIsLoading(false);
        });
        return _stateHandle; // release the handle after checked
    }, [auth]);

    // return a provider structure
    return (
        <authContext.Provider value={{
            firebaseUser,
            isLoading
        }}>
            {children}
        </authContext.Provider>

    )
}

export {useAuth, AuthProvider}