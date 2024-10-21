import {useState, useEffect, createContext} from "react"


const AuthContext = createContext()

const AuthProvider =({children}) => {

    const [auth, setAuth ] = useState({})

    return(
        <AuthContext.Provider>
            {children}
            </AuthContext.Provider>    
    );

}

export {
    AuthProvider
}

export default AuthContext