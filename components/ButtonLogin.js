import Link from 'next/link'
import React from 'react'

function ButtonLogin({isLoggedin, name, extraStyle}) {
    if(isLoggedin){
        return (
            <Link href="/dashboard" className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}>Welcome Back {name}</Link>
        )
    }
    else {
        return <button>Login</button>
    }
}

export default ButtonLogin