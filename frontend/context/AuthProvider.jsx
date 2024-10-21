import {useState, useEffect, createContext} from "react"


const AuthContext = CreateContext(children)

const AuthProvider =() => {

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